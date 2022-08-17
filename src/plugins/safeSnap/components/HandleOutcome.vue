<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import {
  getExecutionDetailsWithHashes,
  executeProposalWithHashes,
  loadClaimBondData,
  sendClaimBondTransaction,
  submitProposalWithHashes,
  voteForQuestion
} from '../index';
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

import SafeSnapModalOptionApproval from './Modal/OptionApproval.vue';

const { formatRelativeTime } = useIntl();
const { t } = useI18n();

const { clearBatchError, setBatchError } = useSafe();
const { web3Account, ensureRightNetwork } = useWeb3();
const { pendingCount } = useTxStatus();
const { notify } = useFlashNotification();

const props = defineProps(['batches', 'proposal', 'network', 'realityAddress']);

enum QUESTION_STATES {
  WAITING_FOR_QUESTION,
  QUESTION_NO_SET,
  QUESTION_NOT_RESOLVED,
  WAITING_FOR_COOLDOWN,
  PROPOSAL_APPROVED,
  PROPOSAL_REJECTED,
  COMPLETELY_EXECUTED,
  TIME_EXPIRED,
  UNKNOWN
}

const loadingDetails = ref(true);
const actionInProgress = ref<string | null>(null);
const action2InProgress = ref<string | null>(null);
const questionDetails = ref<any>(undefined);
const modalApproveDecisionOpen = ref(false);
const bondData = ref<any>({
  tokenSymbol: 'ETH',
  tokenDecimals: 18,
  canClaim: false
});

const getTxHashes = () => {
  return props.batches.map(batch => batch.hash);
};

const updateDetails = async () => {
  loadingDetails.value = true;
  try {
    questionDetails.value = await getExecutionDetailsWithHashes(
      props.network,
      props.realityAddress,
      props.proposal.id,
      getTxHashes()
    );
    console.log('questionDetails', questionDetails.value);
    if (questionDetails.value.questionId && getInstance().web3) {
      bondData.value = await loadClaimBondData(
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
    loadingDetails.value = false;
  }
};

const claimBond = async () => {
  if (!questionDetails.value?.oracle) return;
  if (!bondData.value?.data) return;
  if (!questionDetails.value.questionId) return;
  try {
    actionInProgress.value = 'claim-bond';

    const params = Object.keys(bondData.value.data).map(
      key => new Array(...bondData.value.data[key])
    );

    await ensureRightNetwork(props.network);
    const clamingBond = sendClaimBondTransaction(
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
  if (!questionDetails.value?.proposalId) return;

  actionInProgress.value = 'submit-proposal';
  try {
    await ensureRightNetwork(props.network);
    const proposalSubmission = submitProposalWithHashes(
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
  if (!questionDetails.value?.questionId) return;
  if (!questionDetails.value?.oracle) return;
  if (!questionDetails.value?.minimumBond) return;
  try {
    await ensureRightNetwork(props.network);
    const voting = voteForQuestion(
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
    const executingProposal = executeProposalWithHashes(
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
  } catch (err: Error) {
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
  if (!questionDetails.value.questionId)
    return QUESTION_STATES.WAITING_FOR_QUESTION;

  if (questionDetails.value.currentBond.isZero())
    return QUESTION_STATES.QUESTION_NO_SET;

  const ts = (Date.now() / 1e3).toFixed();
  const { finalizedAt, cooldown, expiration, executionApproved, nextTxIndex } =
    questionDetails.value;

  const isExpired = finalizedAt + expiration < ts;

  if (!finalizedAt) return QUESTION_STATES.QUESTION_NOT_RESOLVED;
  if (executionApproved) {
    if (finalizedAt + cooldown > ts)
      return QUESTION_STATES.WAITING_FOR_COOLDOWN;

    if (!Number.isInteger(nextTxIndex))
      return QUESTION_STATES.COMPLETELY_EXECUTED;
    else if (isExpired) return QUESTION_STATES.TIME_EXPIRED;

    return QUESTION_STATES.PROPOSAL_APPROVED;
  }
  if (isExpired) return QUESTION_STATES.PROPOSAL_REJECTED;

  return QUESTION_STATES.UNKNOWN;
});

const showOracleInfo = computed(() => {
  return [
    QUESTION_STATES.QUESTION_NO_SET,
    QUESTION_STATES.QUESTION_NOT_RESOLVED,
    QUESTION_STATES.WAITING_FOR_COOLDOWN
  ].includes(questionState.value);
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
  <div v-if="loadingDetails" class="my-4">
    <LoadingSpinner />
  </div>
  <template v-else>
    <div v-if="!web3Account" class="my-4">
      {{ $t('safeSnap.labels.connectWallet') }}
    </div>

    <div v-if="connectedToRightChain || usingMetaMask">
      <div
        v-if="questionState === QUESTION_STATES.WAITING_FOR_QUESTION"
        class="my-4"
      >
        <BaseButton
          :loading="actionInProgress === 'submit-proposal'"
          @click="submitProposal"
        >
          {{ $t('safeSnap.labels.request') }}
        </BaseButton>
      </div>

      <div v-if="showOracleInfo || bondData.canClaim" class="my-4">
        <div class="inline-block text-base">
          <h4 class="text-center text-skin-link">
            Reality oracle
            <a class="ml-2 text-skin-text" @click="updateDetails">
              <BaseIcon name="refresh" size="22" />
            </a>
          </h4>
          <div
            v-if="questionState !== QUESTION_STATES.QUESTION_NO_SET"
            class="my-3 flex items-center space-x-3"
            style="text-align: left"
          >
            <div class="self-stretch rounded-lg border p-3">
              <div>
                <strong class="pr-3"
                  >{{
                    questionDetails?.finalizedAt
                      ? $t('safeSnap.finalOutcome')
                      : $t('safeSnap.currentOutcome')
                  }}:</strong
                >
                <span class="float-right text-skin-link">
                  {{ approvalData?.decision }}
                </span>
              </div>
              <div v-if="!questionDetails?.finalizedAt" mt-3>
                <strong class="pr-3">{{ $t('safeSnap.currentBond') }}:</strong>
                <span class="float-right text-skin-link">
                  {{ approvalData?.currentBond }}
                </span>
              </div>
            </div>

            <div
              v-if="approvalData?.timeLeft"
              class="flex items-center justify-center self-stretch rounded-lg border p-3 text-skin-link"
            >
              <strong>{{ approvalData?.timeLeft }}</strong>
            </div>
          </div>

          <div v-if="questionState === QUESTION_STATES.QUESTION_NO_SET">
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
          <div v-if="questionState === QUESTION_STATES.QUESTION_NOT_RESOLVED">
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
          <div v-if="bondData.canClaim">
            <BaseButton
              class="my-1 w-full"
              :loading="actionInProgress === 'claim-bond'"
              @click="claimBond"
            >
              {{ $t('safeSnap.claimBond') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <div
        v-if="questionState === QUESTION_STATES.PROPOSAL_APPROVED"
        class="my-4"
      >
        <BaseButton
          :loading="action2InProgress === 'execute-proposal'"
          @click="executeProposal"
        >
          {{
            $t('safeSnap.labels.executeTxs', [
              questionDetails.nextTxIndex + 1,
              batches.length
            ])
          }}
        </BaseButton>
      </div>
    </div>
    <div v-else-if="web3Account" class="my-4">
      {{ $t('safeSnap.labels.switchChain', [networkName]) }}
    </div>

    <div
      v-if="questionState === QUESTION_STATES.COMPLETELY_EXECUTED"
      class="my-4"
    >
      {{ $t('safeSnap.labels.executed') }}
    </div>

    <div
      v-if="questionState === QUESTION_STATES.PROPOSAL_REJECTED"
      class="my-4"
    >
      {{ $t('safeSnap.labels.rejected') }}
    </div>
    <div v-if="questionState === QUESTION_STATES.TIME_EXPIRED" class="my-4">
      {{ $t('safeSnap.labels.expired') }}
    </div>

    <div v-if="questionState === QUESTION_STATES.UNKNOWN" class="my-4">
      {{ $t('safeSnap.labels.error') }}
    </div>
  </template>

  <teleport to="#modal">
    <SafeSnapModalOptionApproval
      :space-id="proposal.space.id"
      :minimum-bond="questionDetails?.minimumBond"
      :open="modalApproveDecisionOpen"
      :is-approved="questionDetails?.isApproved"
      :bond="questionDetails?.currentBond"
      :question-id="questionDetails?.questionId"
      :token-symbol="bondData?.tokenSymbol"
      :token-decimals="bondData?.tokenDecimals"
      :oracle="questionDetails?.oracle"
      @setApproval="voteOnQuestion"
      @close="(modalApproveDecisionOpen = false), (actionInProgress = null)"
    />
  </teleport>
</template>
