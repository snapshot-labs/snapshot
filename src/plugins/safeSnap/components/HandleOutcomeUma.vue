<script setup>
import { onMounted, ref, computed } from 'vue';
import Plugin from '../index';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

import {
  useWeb3,
  useI18n,
  useIntl,
  useFlashNotification,
  useTxStatus,
  useSafe
} from '@/composables';

const { formatRelativeTime } = useIntl();
const { t } = useI18n();

const { clearBatchError, setBatchError } = useSafe();
const { web3 } = useWeb3();
const { pendingCount } = useTxStatus();
const { notify } = useFlashNotification();

const props = defineProps([
  'batches',
  'proposal',
  'network',
  'umaAddress',
  'multiSendAddress'
]);

const plugin = new Plugin();

const QuestionStates = {
  error: -1,
  noWalletConnection: 0,
  loading: 1,
  waitingForProposal: 2,
  waitingForLiveness: 3,
  proposalApproved: 4,
  proposalRejected: 5,
  completelyExecuted: 6,
  disputedButNotResolved: 7,
  disputedResolvedValid: 8
};
Object.freeze(QuestionStates);

const ensureRightNetwork = async chainId => {
  const chainIdInt = parseInt(chainId);
  const connectedToChainId = getInstance().provider.value?.chainId;
  if (connectedToChainId === chainIdInt) return; // already on right chain

  if (!window.ethereum || !getInstance().provider.value?.isMetaMask) {
    // we cannot switch automatically
    throw new Error(
      `Connected to wrong chain #${connectedToChainId}, required: #${chainId}`
    );
  }

  const network = networks[chainId];
  const chainIdHex = `0x${chainIdInt.toString(16)}`;

  try {
    // check if the chain to connect to is installed
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }] // chainId must be in hexadecimal numbers
    });
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask. Let's add it.
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: network.name,
              rpcUrls: network.rpc,
              blockExplorerUrls: [network.explorer.url]
            }
          ]
        });
      } catch (addError) {
        console.error(addError);
      }
    }
    console.error(error);
  }

  await sleep(1e3); // somehow the switch does not take immediate effect :/
  if (window.ethereum.chainId !== chainIdHex) {
    throw new Error(
      `Could not switch to the right chain on MetaMask (required: ${chainIdHex}, active: ${window.ethereum.chainId})`
    );
  }
};

const loading = ref(true);
const questionStates = ref(QuestionStates);
const actionInProgress = ref(false);
const action2InProgress = ref(false);
const questionDetails = ref(undefined);

const getTransactions = () => {
  return props.batches.map(batch => [
    batch.transactions[0].to,
    Number(batch.transactions[0].operation),
    batch.transactions[0].value,
    batch.transactions[0].data
  ]);
};

const updateDetails = async () => {
  loading.value = true;
  try {
    questionDetails.value = await plugin.getExecutionDetails(
      props.network,
      props.umaAddress,
      props.proposal.id,
      getTransactions()
    );
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const approveBond = async () => {
  if (!questionDetails.value.oracle) return;
  try {
    actionInProgress.value = 'approve-bond';

    await ensureRightNetwork(props.network);

    const approveBond = await plugin.approveBond(
      props.network,
      getInstance().web3,
      props.umaAddress
    );
    await approveBond.next();
    actionInProgress.value = null;
    pendingCount.value++;
    await approveBond.next();
    notify(t('notify.youDidIt'));
    pendingCount.value--;
    await sleep(3e3);
    await updateDetails();
  } catch (e) {
    console.error(e);
    actionInProgress.value = null;
  }
};

const submitProposal = async () => {
  if (!getInstance().isAuthenticated.value) return;
  actionInProgress.value = 'submit-proposal';
  try {
    await ensureRightNetwork(props.network);
    const proposalSubmission = plugin.submitProposal(
      getInstance().web3,
      props.umaAddress,
      getTransactions()
    );
    await proposalSubmission.next();
    actionInProgress.value = null;
    pendingCount.value++;
    await proposalSubmission.next();
    notify(t('notify.youDidIt'));
    pendingCount.value--;
    await sleep(3e3);
    await updateDetails();
  } catch (e) {
    console.error(e);
  } finally {
    actionInProgress.value = null;
  }
};

const executeProposal = async () => {
  if (!getInstance().isAuthenticated.value) return;
  action2InProgress.value = 'execute-proposal';
  try {
    await ensureRightNetwork(props.network);
  } catch (e) {
    console.error(e);
    action2InProgress.value = null;
    return;
  }

  try {
    clearBatchError();
    const executingProposal = plugin.executeProposal(
      getInstance().web3,
      props.umaAddress,
      getTransactions()
    );
    await executingProposal.next();
    action2InProgress.value = null;
    pendingCount.value++;
    await executingProposal.next();
    notify(t('notify.youDidIt'));
    pendingCount.value--;
    await sleep(3e3);
    await updateDetails();
  } catch (err) {
    pendingCount.value--;
    action2InProgress.value = null;
  }
};

const deleteDisputedProposal = async () => {
  if (!getInstance().isAuthenticated.value) return;
  action2InProgress.value = 'delete-disputed-proposal';
  try {
    await ensureRightNetwork(props.network);
  } catch (e) {
    console.error(e);
    action2InProgress.value = null;
    return;
  }

  try {
    clearBatchError();
    const deletingDisputedProposal = plugin.deleteDisputedProposal(
      getInstance().web3,
      props.umaAddress,
      questionDetails.value.proposalEvent.proposalHash
    );
    await deletingDisputedProposal.next();
    action2InProgress.value = null;
    pendingCount.value++;
    await deletingDisputedProposal.next();
    notify(t('notify.youDidIt'));
    pendingCount.value--;
    await sleep(3e3);
    await updateDetails();
  } catch (err) {
    pendingCount.value--;
    action2InProgress.value = null;
  }
};

// TODO: Implement button for deleting rejected proposal.
const deleteRejectedProposal = async () => {
  if (!getInstance().isAuthenticated.value) return;
  action2InProgress.value = 'delete-rejected-proposal';
  try {
    await ensureRightNetwork(props.network);
  } catch (e) {
    console.error(e);
    action2InProgress.value = null;
    return;
  }

  try {
    clearBatchError();
    const deletingRejectedProposal = plugin.deleteRejectedProposal(
      getInstance().web3,
      props.umaAddress,
      questionDetails.value.proposalEvent.proposalHash
    );
    await deletingRejectedProposal.next();
    action2InProgress.value = null;
    pendingCount.value++;
    await deletingRejectedProposal.next();
    notify(t('notify.youDidIt'));
    pendingCount.value--;
    await sleep(3e3);
    await updateDetails();
  } catch (err) {
    pendingCount.value--;
    action2InProgress.value = null;
  }
};

const usingMetaMask = computed(() => {
  return window.ethereum && getInstance().provider.value?.isMetaMask;
});

const connectedToRightChain = computed(() => {
  return getInstance().provider.value?.chainId === parseInt(props.network);
});

const networkName = computed(() => {
  return networks[props.network].name;
});

const questionState = computed(() => {
  if (!web3.value.account) return QuestionStates.noWalletConnection;

  if (loading.value) return QuestionStates.loading;

  if (!questionDetails.value) return QuestionStates.error;

  const ts = (Date.now() / 1e3).toFixed();
  const { proposalEvent, proposalExecuted } = questionDetails.value;

  // If proposal has already been executed, prevents user from proposing again.
  if (proposalExecuted) return QuestionStates.completelyExecuted;

  // Proposal can be made if it has not been made already.
  if (!proposalEvent) return QuestionStates.waitingForProposal;

  // Proposal has been made and is waiting for liveness period to complete.
  if (!proposalEvent.isExpired && !proposalEvent.isDisputed)
    return QuestionStates.waitingForLiveness;

  // If disputed, a proposal can be deleted to enable a proposal to be proposed again.
  if (proposalEvent.isDisputed) return QuestionStates.disputedButNotResolved;

  // Proposal is approved if it expires without a dispute and hasn't been settled.
  if (proposalEvent.isExpired && !proposalEvent.isSettled)
    return QuestionStates.proposalApproved;

  // Proposal is approved if it has been settled without a disputer and hasn't been executed.
  if (proposalEvent.isSettled && !proposalEvent.isDisputed && !proposalExecuted)
    return QuestionStates.proposalApproved;

  // Proposal can not be re-proposed if it has been executed.
  if (proposalEvent.isSettled && proposalExecuted)
    return QuestionStates.completelyExecuted;

  // Proposal can be deleted if it has been rejected.
  if (proposalEvent.isDisputed && proposalEvent.resolvedPrice == 0)
    return QuestionStates.proposalRejected;
  // TODO: Allow user to delete proposal but do not show option to re-propose.

  return QuestionStates.error;
});

onMounted(async () => {
  await updateDetails();
});
</script>

<template>
  <div v-if="questionState === questionStates.error" class="my-4">
    {{ $t('safeSnap.labels.error') }}
  </div>

  <div v-if="questionState === questionStates.noWalletConnection" class="my-4">
    {{ $t('safeSnap.labels.connectWallet') }}
  </div>

  <div v-if="questionState === questionStates.loading" class="my-4">
    <LoadingSpinner />
  </div>

  <div v-if="connectedToRightChain || usingMetaMask">
    <div
      v-if="
        questionState === questionStates.waitingForProposal &&
        questionDetails.needsBondApproval === true
      "
      class="my-4"
    >
      <BaseButton
        :loading="actionInProgress === 'approve-bond'"
        @click="approveBond"
      >
        {{ $t('safeSnap.labels.approveBond') }}
      </BaseButton>
    </div>
    <div
      v-if="
        questionState === questionStates.waitingForProposal &&
        questionDetails.needsBondApproval === false
      "
      class="my-4"
    >
      <BaseButton
        :loading="actionInProgress === 'submit-proposal'"
        @click="submitProposal"
      >
        {{ $t('safeSnap.labels.request') }}
      </BaseButton>
    </div>

    <div
      v-if="questionState === questionStates.waitingForLiveness"
      class="flex items-center justify-center self-stretch rounded-lg border p-3 text-skin-link"
    >
      <strong>{{
        'Proposal can be executed at ' +
        new Date(
          questionDetails.proposalEvent.expirationTimestamp * 1000
        ).toLocaleString()
      }}</strong>
    </div>

    <div
      v-if="questionState === questionStates.disputedButNotResolved"
      class="my-4"
    >
      <BaseButton
        :loading="action2InProgress === 'delete-disputed-proposal'"
        @click="deleteDisputedProposal"
      >
        {{ $t('safeSnap.labels.deleteDisputedProposal') }}
      </BaseButton>
    </div>

    <div v-if="questionState === questionStates.proposalApproved" class="my-4">
      <BaseButton
        :loading="action2InProgress === 'execute-proposal'"
        @click="executeProposal"
      >
        {{
          $t('safeSnap.labels.executeTxsUma', [
            questionDetails.nextTxIndex + 1,
            batches.length
          ])
        }}
      </BaseButton>
    </div>
  </div>
  <div
    v-else-if="
      questionState !== questionStates.loading &&
      questionState !== questionStates.noWalletConnection
    "
    class="my-4"
  >
    {{ $t('safeSnap.labels.switchChain', [networkName]) }}
  </div>

  <div v-if="questionState === questionStates.completelyExecuted" class="my-4">
    {{ $t('safeSnap.labels.executed') }}
  </div>

  <div v-if="questionState === questionStates.proposalRejected" class="my-4">
    {{ $t('safeSnap.labels.rejected') }}
  </div>
</template>
