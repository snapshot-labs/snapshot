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

import SafeSnapModalOptionApprovalUma from './Modal/OptionApprovalUma.vue';

import { ensureRightNetwork } from '../utils';

const { formatRelativeTime } = useIntl();
const { t } = useI18n();

const { clearBatchError, setBatchError } = useSafe();
const { web3 } = useWeb3();
const { pendingCount } = useTxStatus();
const { notify } = useFlashNotification();

const props = defineProps(['batches', 'proposal', 'network', 'moduleAddress']);

const plugin = new Plugin();

const ExecutionStates = {
  error: -1,
  noWalletConnection: 0,
  loading: 1,
  waitingForQuestion: 2,
  questionNotSet: 3,
  questionNotResolved: 4,
  waitingForCooldown: 5,
  proposalApproved: 6,
  proposalRejected: 7,
  completelyExecuted: 8,
  timeExpired: 9
};
Object.freeze(ExecutionStates);

const loading = ref(true);
const executionStates = ref(ExecutionStates);
const actionInProgress = ref(false);
const action2InProgress = ref(false);
const executionDetails = ref(undefined);
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
    executionDetails.value = await plugin.getExecutionDetailsWithHashesUma(
      props.network,
      props.moduleAddress,
      props.proposal.id,
      getTxHashes()
    );
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const submitProposal = async () => {
  if (!getInstance().isAuthenticated.value) return;
  actionInProgress.value = 'submit-proposal';

  const txs = props.batches.map(batch => batch.transactions);

  try {
    await ensureRightNetwork(props.network);
    const proposalSubmission = await plugin.submitUmaProposalWithHashes(
      getInstance().web3,
      props.moduleAddress,
      executionDetails.value.proposalId,
      props.batches
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
    const transaction =
      props.batches[executionDetails.value.nextTxIndex].mainTransaction;
    const executingProposal = plugin.executeProposalWithHashes(
      getInstance().web3,
      props.moduleAddress,
      executionDetails.value.proposalId,
      getTxHashes(),
      transaction,
      executionDetails.value.nextTxIndex
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
    setBatchError(executionDetails.value.nextTxIndex, err.reason);
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

const executionState = computed(() => {
  if (!web3.value.account) return ExecutionStates.noWalletConnection;

  if (loading.value) return ExecutionStates.loading;

  if (!executionDetails.value) return ExecutionStates.error;

  if (!executionDetails.value.questionId)
    return ExecutionStates.waitingForQuestion;

  if (executionDetails.value.currentBond.isZero())
    return ExecutionStates.questionNotSet;

  const ts = (Date.now() / 1e3).toFixed();
  const { finalizedAt, cooldown, expiration, executionApproved, nextTxIndex } =
    executionDetails.value;

  const isExpired = finalizedAt + expiration < ts;

  if (!finalizedAt) return ExecutionStates.questionNotResolved;
  if (executionApproved) {
    if (finalizedAt + cooldown > ts) return ExecutionStates.waitingForCooldown;

    if (!Number.isInteger(nextTxIndex))
      return ExecutionStates.completelyExecuted;
    else if (isExpired) return ExecutionStates.timeExpired;

    return ExecutionStates.proposalApproved;
  }
  if (isExpired) return ExecutionStates.proposalRejected;

  return ExecutionStates.error;
});

const showOracleInfo = computed(() => {
  return (
    executionState.value === executionStates.value.questionNotSet ||
    executionState.value === executionStates.value.questionNotResolved ||
    executionState.value === executionStates.value.waitingForCooldown
  );
});

const approvalData = computed(() => {
  if (executionDetails.value) {
    const { currentBond, finalizedAt, isApproved, endTime } =
      executionDetails.value;

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
            formatRelativeTime(endTime + executionDetails.value.cooldown)
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
      currentBond: `${formatUnits(currentBond, bondData.value.tokenDecimals)} ${
        bondData.value.tokenSymbol
      }`
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

<template>
  <div v-if="executionState === executionStates.error" class="my-4">
    {{ $t('safeSnap.labels.error') }}
  </div>

  <div
    v-if="executionState === executionStates.noWalletConnection"
    class="my-4"
  >
    {{ $t('safeSnap.labels.connectWallet') }}
  </div>

  <div v-if="executionState === executionStates.loading" class="my-4">
    <LoadingSpinner />
  </div>

  <div v-if="connectedToRightChain || usingMetaMask">
    <div
      v-if="executionState === executionStates.waitingForQuestion"
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
      v-if="
        (showOracleInfo || bondData.canClaim) &&
        executionState !== executionStates.loading
      "
      class="my-4"
    >
      <div class="inline-block text-base">
        <h4 class="text-center text-skin-link">
          Uma optimistic oracle
          <a class="ml-2 text-skin-text" @click="updateDetails">
            <BaseIcon name="refresh" size="22" />
          </a>
        </h4>
        <div v-if="executionState === executionState.questionNotSet">
          <BaseButton
            class="mb-1 mt-3 w-full"
            :loading="actionInProgress === 'set-outcome'"
            @click="
              modalApproveDecisionOpen = true;
              actionInProgress = 'set-outcome';
            "
          >
            {{ $t('safeSnap.labels.setOutcome') }}
          </BaseButton>
        </div>
        <div v-if="executionState === executionState.questionNotResolved">
          <BaseButton
            class="my-1 w-full"
            :loading="actionInProgress === 'set-outcome'"
            @click="
              modalApproveDecisionOpen = true;
              actionInProgress = 'set-outcome';
            "
          >
            {{ $t('safeSnap.labels.changeOutcome') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-if="executionState === executionStates.notDisputed" class="my-4">
      <BaseButton
        :loading="action2InProgress === 'execute-proposal'"
        @click="executeProposal"
      >
        {{ $t('safeSnap.labels.executeTxs', [1, 1]) }}
      </BaseButton>
    </div>
  </div>
  <div
    v-else-if="
      executionState !== executionStates.loading &&
      executionState !== executionStates.noWalletConnection
    "
    class="my-4"
  >
    {{ $t('safeSnap.labels.switchChain', [networkName]) }}
  </div>

  <div
    v-if="executionState === executionStates.completelyExecuted"
    class="my-4"
  >
    {{ $t('safeSnap.labels.executed') }}
  </div>

  <div v-if="executionState === executionStates.proposalRejected" class="my-4">
    {{ $t('safeSnap.labels.rejected') }}
  </div>

  <teleport to="#modal">
    <SafeSnapModalOptionApprovalUma
      :space-id="proposal.space.id"
      :minimum-bond="executionDetails?.minimumBond"
      :open="modalApproveDecisionOpen"
      :is-approved="executionDetails?.isApproved"
      :bond="executionDetails?.currentBond"
      :question-id="executionDetails?.questionId"
      :token-symbol="bondData?.tokenSymbol"
      :token-decimals="bondData?.tokenDecimals"
      :oracle="executionDetails?.oracle"
      @close="modalApproveDecisionOpen = actionInProgress = false"
    />
  </teleport>
</template>
