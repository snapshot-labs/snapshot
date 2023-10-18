<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import {
  ProposalExecutionDetails,
  type Network,
  type Transaction
} from '../../types';
import {
  approveBond,
  executeProposal,
  getProposalExecutionDetails,
  submitProposal
} from '../../utils';
import AssertionFailedInOO from './steps/AssertionFailedInOO.vue';
import AssertionPassedInOO from './steps/AssertionPassedInOO.vue';
import InOOChallengePeriod from './steps/InOOChallengePeriod.vue';
import ReadyForOOAssertion from './steps/ReadyForOOAssertion.vue';
import RejectedBySnapshotVote from './steps/RejectedBySnapshotVote.vue';
import TallyingSnapshotVotes from './steps/TallyingSnapshotVotes.vue';
import TransactionsExecuted from './steps/TransactionsExecuted.vue';

declare global {
  interface Window {
    ethereum: any;
  }
}

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  transactions: Transaction[];
  network: Network;
  moduleAddress: string;
}>();

const { web3 } = useWeb3();
const {
  createPendingTransaction,
  updatePendingTransaction,
  removePendingTransaction
} = useTxStatus();
const { notify } = useFlashNotification();
const { quorum } = useQuorum(props);

type ProposalExecutionStep =
  | 'tallying-snapshot-votes'
  | 'rejected-by-snapshot-vote'
  | 'ready-for-oo-assertion'
  | 'in-oo-challenge-period'
  | 'assertion-passed-in-oo'
  | 'assertion-failed-in-oo'
  | 'transactions-executed';

const isLoading = ref(true);
const proposalExecutionDetails = ref<ProposalExecutionDetails>();
const hasConnectedWallet = computed(() => !!web3.value.account);

const proposalExecutionStep = computed<ProposalExecutionStep | undefined>(
  () => {
    if (!proposalExecutionDetails.value) return;

    const { assertionEvent, proposalExecuted, activeProposal } =
      proposalExecutionDetails.value;

    if (proposalExecuted) return 'transactions-executed';

    const proposalFinalized = wasProposalFinalized(props.proposal);

    if (!proposalFinalized) return 'tallying-snapshot-votes';

    const proposalPassed = didProposalPass(props.proposal);

    if (!proposalPassed) return 'rejected-by-snapshot-vote';

    if (!activeProposal) return 'ready-for-oo-assertion';

    if (assertionEvent && !assertionEvent.isExpired)
      return 'in-oo-challenge-period';

    if (
      assertionEvent &&
      assertionEvent.isExpired &&
      assertionEvent.isSettled &&
      assertionEvent.rejectedByOracle
    )
      return 'assertion-failed-in-oo';

    if (assertionEvent && assertionEvent.isExpired && !assertionEvent.isSettled)
      return 'assertion-passed-in-oo';

    if (assertionEvent && assertionEvent.isSettled && !proposalExecuted)
      return 'assertion-passed-in-oo';
  }
);

function getFormattedTransactions() {
  return props.transactions.map(transaction => {
    return transaction.formatted;
  });
}

async function updateDetails() {
  isLoading.value = true;
  try {
    proposalExecutionDetails.value = await getProposalExecutionDetails(
      props.network,
      props.moduleAddress,
      props.proposal.id,
      props.proposal.ipfs,
      getFormattedTransactions()
    );
  } catch (e) {
    console.error('Error loading uma execution details', e);
  } finally {
    isLoading.value = false;
  }
}

async function onApproveBond() {
  const txPendingId = createPendingTransaction();
  try {
    await ensureRightNetwork(props.network);

    const approvingBond = approveBond(
      props.network,
      getInstance().web3,
      props.moduleAddress
    );
    const step = await approvingBond.next();
    if (step.value)
      updatePendingTransaction(txPendingId, { hash: step.value.hash });
    await approvingBond.next();
    notify('Successfully approved bond');
    await sleep(3e3);
    await updateDetails();
  } catch (e) {
    console.error(e);
    notify(['red', 'Failed to approve bond']);
  } finally {
    removePendingTransaction(txPendingId);
  }
}

async function onSubmitProposal() {
  if (!getInstance().isAuthenticated.value) return;
  const txPendingId = createPendingTransaction();
  try {
    await ensureRightNetwork(props.network);
    const proposalSubmission = submitProposal(
      getInstance().web3,
      props.moduleAddress,
      props.proposal.ipfs,
      getFormattedTransactions()
    );
    const step = await proposalSubmission.next();
    if (step.value)
      updatePendingTransaction(txPendingId, { hash: step.value.hash });
    await proposalSubmission.next();
    notify('Proposal submitted successfully');
    await sleep(3e3);
    await updateDetails();
  } catch (e) {
    notify(['red', 'Failed to submit proposal']);
    console.error(e);
  } finally {
    removePendingTransaction(txPendingId);
  }
}

async function onExecuteProposal() {
  if (!getInstance().isAuthenticated.value) return;
  const txPendingId = createPendingTransaction();
  try {
    await ensureRightNetwork(props.network);
  } catch (e) {
    console.error(e);
  }

  try {
    const executingProposal = executeProposal(
      getInstance().web3,
      props.moduleAddress,
      getFormattedTransactions()
    );
    const step = await executingProposal.next();
    if (step.value)
      updatePendingTransaction(txPendingId, { hash: step.value.hash });
    await executingProposal.next();
    notify('Proposal executed successfully');
    await sleep(3e3);
    await updateDetails();
  } catch (err) {
    notify(['red', 'Failed to execute proposal']);
  } finally {
    removePendingTransaction(txPendingId);
  }
}

const connectedToRightChain = computed(() => {
  return getInstance().provider.value?.chainId === `0x${props.network}`;
});

const networkName = computed(() => {
  return networks[props.network].name;
});

function didProposalPass(proposal: Proposal) {
  // ensure the vote has ended
  if (proposal.state !== 'closed') return false;
  // ensure total votes are more than quorum
  if (proposal.scores_total && proposal.scores_total < proposal.quorum)
    return false;
  const votes = Object.fromEntries(
    proposal.choices.map((choice, i) => {
      return [choice.toLowerCase(), proposal.scores[i] ?? 0];
    })
  );
  // ensure the for votes pass quorum and that there are more for votes than against
  return votes['for'] > proposal.scores_total / 2;
}

function wasProposalFinalized(proposal: Proposal) {
  return proposal.scores_state === 'final';
}

async function ensureRightNetwork(chainId: Network) {
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
    // @ts-expect-error non-standard error type
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
}

onMounted(async () => {
  await updateDetails();
});
</script>

<template>
  <div v-if="!hasConnectedWallet" class="my-4">
    Connect your wallet to see execution details
  </div>
  <div v-if="!connectedToRightChain" class="my-4">
    Switch your wallet to {{ networkName }} to request execution
  </div>
  <template v-if="hasConnectedWallet && connectedToRightChain">
    <div v-if="isLoading" class="grid place-items-center">
      <LoadingSpinner />
    </div>
    <template
      v-if="
        !isLoading &&
        proposalExecutionStep !== undefined &&
        proposalExecutionDetails !== undefined
      "
    >
      <h3>Request transaction execution</h3>
      <TallyingSnapshotVotes
        v-if="proposalExecutionStep === 'tallying-snapshot-votes'"
      />
      <RejectedBySnapshotVote
        v-if="proposalExecutionStep === 'rejected-by-snapshot-vote'"
      />
      <ReadyForOOAssertion
        v-if="proposalExecutionStep === 'ready-for-oo-assertion'"
        :needs-bond-approval="proposalExecutionDetails.needsBondApproval"
        :minimum-bond="proposalExecutionDetails.minimumBond"
        :user-balance="proposalExecutionDetails.userBalance"
        :decimals="proposalExecutionDetails.decimals"
        :symbol="proposalExecutionDetails.symbol"
        :liveness-period="
          Number(proposalExecutionDetails.livenessPeriod.toString())
        "
        :quorum="quorum"
        :scores-total="proposal.scores_total"
        @submit-proposal="onSubmitProposal"
        @approve-bond="onApproveBond"
      />
      <InOOChallengePeriod
        v-if="
          proposalExecutionStep === 'in-oo-challenge-period' &&
          !!proposalExecutionDetails.assertionEvent
        "
        :network="network"
        :expiration-timestamp="
          proposalExecutionDetails.assertionEvent.expirationTimestamp
        "
        :proposal-tx-hash="
          proposalExecutionDetails.assertionEvent.proposalTxHash
        "
        :log-index="proposalExecutionDetails.assertionEvent.logIndex"
      />
      <AssertionFailedInOO
        v-if="
          proposalExecutionStep === 'assertion-failed-in-oo' &&
          !!proposalExecutionDetails.assertionEvent
        "
        :network="network"
        :proposal-tx-hash="
          proposalExecutionDetails.assertionEvent.proposalTxHash
        "
        :log-index="proposalExecutionDetails.assertionEvent.logIndex"
      />
      <AssertionPassedInOO
        v-if="proposalExecutionStep === 'assertion-passed-in-oo'"
        :transaction-count="transactions.length"
        @execute-proposal="onExecuteProposal"
      />
      <TransactionsExecuted
        v-if="proposalExecutionStep === 'transactions-executed'"
      />
    </template>
  </template>
</template>
