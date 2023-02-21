<script setup>
import { onMounted, ref, computed } from 'vue';
import Plugin from '../index';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { ensureRightNetwork } from './SafeTransactions.vue';
import { useIntl } from '@/composables/useIntl';

import {
  useWeb3,
  useI18n,
  useFlashNotification,
  useTxStatus,
  useSafe
} from '@/composables';

const { formatDuration } = useIntl();
const { t } = useI18n();

const { clearBatchError } = useSafe();
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
  waitingForVoteConfirmation: 2,
  noTransactions: 3,
  completelyExecuted: 4,
  disputedButNotResolved: 5,
  waitingForProposal: 6,
  waitingForLiveness: 7,
  proposalApproved: 8
};
Object.freeze(QuestionStates);

const loading = ref(true);
const actionInProgress = ref(false);
const action2InProgress = ref(false);
const voteResultsConfirmed = ref(false);
const questionStates = ref(QuestionStates);
const questionDetails = ref(undefined);
const closeModal = ref(false);

function closeEvent() {
  closeModal.value = false;
  voteResultsConfirmed.value = false;
}

function showProposeModal() {
  closeModal.value = true;
  voteResultsConfirmed.value = true;
}

const getTransactionsUma = () => {
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
    questionDetails.value = await plugin.getExecutionDetailsUma(
      props.network,
      props.umaAddress,
      props.proposal.id,
      props.proposal.ipfs,
      getTransactionsUma()
    );
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const approveBondUma = async () => {
  if (!questionDetails.value.oracle) return;
  try {
    actionInProgress.value = 'approve-bond';

    await ensureRightNetwork(props.network);

    const approveBond = await plugin.approveBondUma(
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

const getProposalUrl = (chain, txHash) => {
  if (Number(chain) !== 5 && Number(chain) !== 80001) {
    return `https://oracle.umaproject.org/request?transactionHash=${txHash}&chainId=${chain}&oracleType=OptimisticV2&eventIndex=0`;
  }
  return `https://testnet.oracle.umaproject.org/request?transactionHash=${txHash}&chainId=${chain}&oracleType=OptimisticV2&eventIndex=0`;
};

const submitProposalUma = async () => {
  if (!getInstance().isAuthenticated.value) return;
  actionInProgress.value = 'submit-proposal';
  try {
    await ensureRightNetwork(props.network);
    const proposalSubmission = plugin.submitProposalUma(
      getInstance().web3,
      props.umaAddress,
      props.proposal.ipfs,
      getTransactionsUma()
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

const executeProposalUma = async () => {
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
    const executingProposal = plugin.executeProposalUma(
      getInstance().web3,
      props.umaAddress,
      getTransactionsUma()
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

const deleteDisputedProposalUma = async () => {
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
    const deletingDisputedProposal = plugin.deleteDisputedProposalUma(
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

  if (questionDetails.value.noTransactions)
    return QuestionStates.noTransactions;

  const ts = (Date.now() / 1e3).toFixed();
  const { proposalEvent, proposalExecuted, activeProposal } =
    questionDetails.value;

  // If proposal has already been executed, prevents user from proposing again.
  if (proposalExecuted) return QuestionStates.completelyExecuted;

  // User can confirm vote results if not done already and there is no proposal yet.
  if (!activeProposal && !voteResultsConfirmed.value)
    return QuestionStates.waitingForVoteConfirmation;

  // Proposal can be made if it has not been made already and user confirmed vote results.
  if (!activeProposal && voteResultsConfirmed)
    return QuestionStates.waitingForProposal;

  // If disputed, a proposal can be deleted to enable a proposal to be proposed again.
  if (proposalEvent.isDisputed) return QuestionStates.disputedButNotResolved;

  // Proposal has been made and is waiting for liveness period to complete.
  if (!proposalEvent.isExpired) return QuestionStates.waitingForLiveness;

  // Proposal is approved if it expires without a dispute and hasn't been settled.
  if (proposalEvent.isExpired && !proposalEvent.isSettled)
    return QuestionStates.proposalApproved;

  // Proposal is approved if it has been settled without a disputer and hasn't been executed.
  if (proposalEvent.isSettled && !proposalEvent.isDisputed && !proposalExecuted)
    return QuestionStates.proposalApproved;

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
      v-if="questionState === questionStates.waitingForVoteConfirmation"
      class="my-4 inline-block"
    >
      <BaseContainer class="flex items-center">
        <BaseButton
          :loading="actionInProgress === 'confirm-vote-results'"
          @click="showProposeModal"
          class="mr-2"
        >
          {{ $t('safeSnap.labels.confirmVoteResults') }}
        </BaseButton>
      </BaseContainer>
    </div>

    <div v-if="questionState === questionStates.noTransactions" class="my-4">
      {{ $t('safeSnap.labels.noTransactions') }}
    </div>

    <div
      v-if="
        questionState === questionStates.waitingForProposal &&
        questionDetails.needsBondApproval === true
      "
      class="my-4 inline-block"
    >
      <BaseContainer class="flex items-center">
        <BaseButton
          :loading="actionInProgress === 'approve-bond'"
          @click="approveBondUma"
          class="mr-2"
        >
          {{ $t('safeSnap.labels.approveBond') }}
        </BaseButton>
        <BasePopoverHover placement="top">
          <template #button>
            <i-ho-information-circle />
          </template>
          <template #content>
            <div class="border bg-skin-bg p-3 text-md shadow-lg md:rounded-lg">
              {{ $t('safeSnap.labels.approveBondToolTip') }}
            </div>
          </template>
        </BasePopoverHover>
      </BaseContainer>
    </div>
    <div
      v-if="
        questionState === questionStates.waitingForProposal &&
        questionDetails.needsBondApproval === false
      "
      class="my-4 inline-block"
    >
      <BaseContainer class="flex items-center">
        <BaseModal :open="closeModal" @close="closeEvent">
          <template #header>
            <h3 class="title">{{ $t('safeSnap.labels.request') }}</h3>
          </template>
          <div class="my-3 p-3">
            <div class="pr-3 pl-3">
              <p>{{ $t('safeSnap.labels.confirmVoteResultsToolTip') }}</p>
            </div>
            <div class="my-3 rounded-lg border p-3">
              <div>
                <strong class="pr-3">{{
                  $t('safeSnap.labels.requiredBond')
                }}</strong>
                <span class="float-right text-skin-link">
                  {{
                    questionDetails.minimumBond.toString() +
                    ' ' +
                    questionDetails.symbol
                  }}
                </span>
              </div>
              <div>
                <strong class="pr-3">{{
                  $t('safeSnap.labels.challengePeriod')
                }}</strong>
                <span class="float-right text-skin-link">
                  {{ formatDuration(Number(questionDetails.livenessPeriod)) }}
                </span>
              </div>
            </div>
            <div>
              <BaseMessage
                v-if="
                  Number(questionDetails.minimumBond.toString()) >
                  Number(questionDetails.userBalance.toString())
                "
                level="warning-red"
              >
                {{ $t('safeSnap.labels.bondWarning') }}
              </BaseMessage>
            </div>

            <BaseButton
              :loading="actionInProgress === 'submit-proposal'"
              @click="submitProposalUma"
              class="my-1 w-full"
              :disabled="
                Number(questionDetails.minimumBond.toString()) >
                Number(questionDetails.userBalance.toString())
              "
            >
              {{ $t('safeSnap.labels.request') }}
            </BaseButton>
          </div>
        </BaseModal>
      </BaseContainer>
    </div>

    <div
      v-if="questionState === questionStates.waitingForLiveness"
      class="flex items-center justify-center self-stretch p-3 text-skin-link"
    >
      <BaseContainer class="my-1 inline-block">
        <div>
          <strong>{{
            'Proposal can be executed at ' +
            new Date(
              questionDetails.proposalEvent.expirationTimestamp * 1000
            ).toLocaleString()
          }}</strong>
        </div>

        <div style="text-align: center" class="mt-3">
          <a
            :href="
              getProposalUrl(
                props.network,
                questionDetails.proposalEvent.proposalTxHash
              )
            "
            class="rounded-lg border p-2 text-skin-text"
            rel="noreferrer noopener"
            target="_blank"
            style="font-size: 16px"
          >
            {{ $t('safeSnap.labels.disputeProposal') }}
            <em style="font-size: 14px" class="iconfont iconexternal-link" />
          </a>
        </div>
      </BaseContainer>
    </div>

    <div
      v-if="questionState === questionStates.disputedButNotResolved"
      class="my-4"
    >
      <BaseButton
        :loading="action2InProgress === 'delete-disputed-proposal'"
        @click="deleteDisputedProposalUma"
      >
        {{ $t('safeSnap.labels.deleteDisputedProposal') }}
      </BaseButton>
    </div>

    <div
      v-if="questionState === questionStates.proposalApproved"
      class="my-4 inline-block"
    >
      <BaseContainer class="flex items-center">
        <BaseButton
          :loading="action2InProgress === 'execute-proposal'"
          @click="executeProposalUma"
          class="mr-2"
        >
          {{
            $t('safeSnap.labels.executeTxsUma', [
              questionDetails.nextTxIndex + 1,
              batches.length
            ])
          }}
        </BaseButton>
        <BasePopoverHover placement="top">
          <template #button>
            <i-ho-information-circle />
          </template>
          <template #content>
            <div class="border bg-skin-bg p-3 text-md shadow-lg md:rounded-lg">
              {{ $t('safeSnap.labels.executeToolTip') }}
            </div>
          </template>
        </BasePopoverHover>
      </BaseContainer>
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
</template>
