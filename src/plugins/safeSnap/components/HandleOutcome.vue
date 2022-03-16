<template>
  <div v-if="questionState === questionStates.error" class="my-4">
    {{ $t('safeSnap.labels.error') }}
  </div>

  <div v-if="questionState === questionStates.noWalletConnection" class="my-4">
    {{ $t('safeSnap.labels.connectWallet') }}
  </div>

  <div v-if="questionState === questionStates.loading" class="my-4">
    <UiLoading />
  </div>

  <div v-if="connectedToRightChain || usingMetaMask">
    <div
      v-if="questionState === questionStates.waitingForQuestion"
      class="my-4"
    >
      <UiButton
        @click="submitProposal"
        :loading="actionInProgress === 'submit-proposal'"
      >
        {{ $t('safeSnap.labels.request') }}
      </UiButton>
    </div>

    <div
      v-if="
        (showOracleInfo || bondData.canClaim) &&
        questionState !== questionStates.loading
      "
      class="my-4"
    >
      <div class="text-base inline-block">
        <h4 class="text-center text-skin-link">
          Reality oracle
          <a @click="updateDetails" class="ml-2 text-skin-text">
            <BaseIcon name="refresh" size="22" />
          </a>
        </h4>
        <div
          v-if="questionState !== questionStates.questionNotSet"
          class="flex items-center my-3 space-x-3"
          style="text-align: left"
        >
          <div class="border rounded-lg p-3 self-stretch">
            <div>
              <b class="pr-3"
                >{{
                  questionDetails?.finalizedAt
                    ? $t('safeSnap.finalOutcome')
                    : $t('safeSnap.currentOutcome')
                }}:</b
              >
              <span class="float-right text-skin-link">
                {{ approvalData?.decision }}
              </span>
            </div>
            <div v-if="!questionDetails?.finalizedAt" mt-3>
              <b class="pr-3">{{ $t('safeSnap.currentBond') }}:</b>
              <span class="float-right text-skin-link">
                {{ approvalData?.currentBond }}
              </span>
            </div>
          </div>

          <div
            v-if="approvalData?.timeLeft"
            class="border rounded-lg p-3 text-skin-link self-stretch items-center justify-center flex"
          >
            <b>{{ approvalData?.timeLeft }}</b>
          </div>
        </div>

        <div v-if="questionState === questionStates.questionNotSet">
          <UiButton
            class="w-full mb-1 mt-3"
            @click="
              modalApproveDecisionOpen = true;
              actionInProgress = 'set-outcome';
            "
            :loading="actionInProgress === 'set-outcome'"
          >
            {{ $t('safeSnap.labels.setOutcome') }}
          </UiButton>
        </div>
        <div v-if="questionState === questionStates.questionNotResolved">
          <UiButton
            class="w-full my-1"
            @click="
              modalApproveDecisionOpen = true;
              actionInProgress = 'set-outcome';
            "
            :loading="actionInProgress === 'set-outcome'"
          >
            {{ $t('safeSnap.labels.changeOutcome') }}
          </UiButton>
        </div>
        <div v-if="bondData.canClaim">
          <UiButton
            class="w-full my-1"
            @click="claimBond"
            :loading="actionInProgress === 'claim-bond'"
          >
            {{ $t('safeSnap.claimBond') }}
          </UiButton>
        </div>
      </div>
    </div>

    <div v-if="questionState === questionStates.proposalApproved" class="my-4">
      <UiButton
        @click="executeProposal"
        :loading="action2InProgress === 'execute-proposal'"
      >
        {{
          $t('safeSnap.labels.executeTxs', [
            questionDetails.nextTxIndex + 1,
            batches.length
          ])
        }}
      </UiButton>
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

  <teleport to="#modal">
    <SafeSnapModalOptionApproval
      :minimumBond="questionDetails?.minimumBond"
      :open="modalApproveDecisionOpen"
      :isApproved="questionDetails?.isApproved"
      :bond="questionDetails?.currentBond"
      :questionId="questionDetails?.questionId"
      :tokenSymbol="bondData?.tokenSymbol"
      :tokenDecimals="bondData?.tokenDecimals"
      :oracle="questionDetails?.oracle"
      @setApproval="voteOnQuestion"
      @close="modalApproveDecisionOpen = actionInProgress = false"
    />
  </teleport>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import Plugin from '../index';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { useSafesnap } from '@/composables/useSafesnap';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useIntl } from '@/composables/useIntl';
import { useI18n } from '@/composables/useI18n';

import SafeSnapModalOptionApproval from './Modal/OptionApproval.vue';

const { formatRelativeTime } = useIntl();
const { t } = useI18n();

const { clearBatchError, setBatchError } = useSafesnap();
const { web3 } = useWeb3();
const { pendingCount } = useTxStatus();
const { notify } = useFlashNotification();

const props = defineProps([
  'batches',
  'proposal',
  'network',
  'realityAddress',
  'multiSendAddress'
]);

const plugin = new Plugin();

const QuestionStates = {
  error: -1,
  noWalletConnection: 0,
  loading: 1,
  waitingForQuestion: 2,
  questionNotSet: 3,
  questionNotResolved: 4,
  waitingForCooldown: 5,
  proposalApproved: 6,
  proposalRejected: 7,
  completelyExecuted: 8
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
              blockExplorerUrls: [network.explorer]
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
const modalApproveDecisionOpen = ref(false);
const bondData = ref({
  tokenSymbol: 'ETH',
  canClaim: undefined,
  data: undefined
});

const getTxHashes = () => {
  return props.batches.map(batch => batch.hash);
};

const updateDetails = async () => {
  loading.value = true;
  try {
    questionDetails.value = await plugin.getExecutionDetailsWithHashes(
      props.network,
      props.realityAddress,
      props.proposal.id,
      getTxHashes()
    );
    if (questionDetails.value.questionId && getInstance().web3) {
      bondData.value = await plugin.loadClaimBondData(
        getInstance().web3,
        props.network,
        questionDetails.value.questionId,
        questionDetails.value.oracle,
        props.proposal.snapshot
      );
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const claimBond = async () => {
  if (!questionDetails.value.oracle) return;
  try {
    actionInProgress.value = 'claim-bond';

    const params = Object.keys(bondData.value.data).map(
      key => new Array(...bondData.value.data[key])
    );

    await ensureRightNetwork(props.network);
    const clamingBond = plugin.claimBond(
      getInstance().web3,
      questionDetails.value.oracle,
      questionDetails.value.questionId,
      params
    );
    await clamingBond.next();
    actionInProgress.value = null;
    pendingCount.value++;
    await clamingBond.next();
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
    const proposalSubmission = plugin.submitProposalWithHashes(
      getInstance().web3,
      props.realityAddress,
      questionDetails.value.proposalId,
      getTxHashes()
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

const voteOnQuestion = async option => {
  if (!getInstance().isAuthenticated.value) return;
  try {
    await ensureRightNetwork(props.network);
    const voting = plugin.voteForQuestion(
      props.network,
      getInstance().web3,
      questionDetails.value.oracle,
      questionDetails.value.questionId,
      questionDetails.value.minimumBond,
      option
    );
    const step = await voting.next();
    if (step.value === 'erc20-approval') {
      actionInProgress.value = null;
      pendingCount.value++;
      await voting.next();
      pendingCount.value--;
      await voting.next();
    }
    actionInProgress.value = null;
    pendingCount.value++;
    await voting.next();
    pendingCount.value--;
    await sleep(3e3);
    await updateDetails();
  } catch (e) {
    console.error(e);
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
    const transaction =
      props.batches[questionDetails.value.nextTxIndex].mainTransaction;
    const executingProposal = plugin.executeProposalWithHashes(
      getInstance().web3,
      props.realityAddress,
      questionDetails.value.proposalId,
      getTxHashes(),
      transaction,
      questionDetails.value.nextTxIndex
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
    setBatchError(questionDetails.value.nextTxIndex, err.reason);
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

  if (!questionDetails.value.questionId)
    return QuestionStates.waitingForQuestion;

  if (questionDetails.value.currentBond.isZero())
    return QuestionStates.questionNotSet;

  if (!questionDetails.value.finalizedAt)
    return QuestionStates.questionNotResolved;

  const ts = (Date.now() / 1e3).toFixed();
  if (questionDetails.value.executionApproved) {
    if (
      questionDetails.value.finalizedAt + questionDetails.value.cooldown >
      ts
    ) {
      return QuestionStates.waitingForCooldown;
    }
    if (!Number.isInteger(questionDetails.value.nextTxIndex))
      return QuestionStates.completelyExecuted;
    return QuestionStates.proposalApproved;
  } else {
    if (questionDetails.value.finalizedAt < ts) {
      return QuestionStates.proposalRejected;
    }
  }

  return QuestionStates.error;
});

const showOracleInfo = computed(() => {
  return (
    questionState.value === questionStates.value.questionNotSet ||
    questionState.value === questionStates.value.questionNotResolved ||
    questionState.value === questionStates.value.waitingForCooldown
  );
});

const approvalData = computed(() => {
  if (questionDetails.value) {
    const { currentBond, finalizedAt, isApproved, endTime } =
      questionDetails.value;

    if (currentBond === undefined || BigNumber.from(currentBond).eq(0)) {
      return {
        decision: '--',
        timeLeft: '--',
        currentBond: '--'
      };
    }

    if (finalizedAt) {
      if (isApproved) {
        return {
          decision: 'Yes',
          timeLeft: t('safeSnap.executableIn', [
            formatRelativeTime(endTime + questionDetails.value.cooldown)
          ])
        };
      }

      return {
        decision: 'No'
      };
    }

    return {
      decision: isApproved ? 'Yes' : 'No',
      timeLeft: t('safeSnap.finalizedIn', [formatRelativeTime(endTime)]),
      currentBond:
        formatUnits(currentBond, bondData.value.tokenDecimals) +
        ' ' +
        bondData.value.tokenSymbol
    };
  }
  return {
    decision: '--',
    timeLeft: '--',
    currentBond: '--'
  };
});

onMounted(async () => {
  await updateDetails();
});
</script>
