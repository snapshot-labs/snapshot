<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import voting from '@snapshot-labs/snapshot.js/src/voting';
import { useRoute, useRouter } from 'vue-router';
import { getProposalVotes } from '@/helpers/snapshot';
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';
import {
  useI18n,
  useModal,
  useTerms,
  useWeb3,
  useInfiniteLoader
} from '@/composables';

const props = defineProps<{ space: ExtendedSpace; proposal: Proposal }>();
const emit = defineEmits(['reload-proposal']);

const route = useRoute();
const router = useRouter();

const { setPageTitle } = useI18n();
const { web3, web3Account } = useWeb3();

const proposalId: string = route.params.id as string;

const modalOpen = ref(false);
const isModalPostVoteOpen = ref(false);
const selectedChoices = ref<any>(null);
const loadedResults = ref(false);
const loadedVotes = ref(false);
const votes = ref([]);
const userVote = ref<Vote | null>(null);
const results = ref<Results | null>(null);

const isAdmin = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});
const strategies = computed(
  // Needed for older proposal that are missing strategies
  () => props.proposal?.strategies ?? props.space.strategies
);

const browserHasHistory = computed(() => window.history.state.back);

const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

function clickVote() {
  !web3.value.account
    ? (modalAccountOpen.value = true)
    : !termsAccepted.value && props.space.terms
    ? (modalTermsOpen.value = true)
    : (modalOpen.value = true);
}

function reloadProposal() {
  emit('reload-proposal');
}

function formatProposalVotes(votes) {
  if (!votes.length) return [];
  return votes.map(vote => {
    vote.balance = vote.vp;
    vote.scores = vote.vp_by_strategy;
    return vote;
  });
}

async function loadResults() {
  if (props.proposal.scores.length === 0) {
    const votingClass = new voting[props.proposal.type](
      props.proposal,
      [],
      strategies.value
    );
    results.value = {
      scores: votingClass.getScores(),
      scoresByStrategy: votingClass.getScoresByStrategy(),
      scoresTotal: votingClass.getScoresTotal()
    };
  } else {
    results.value = {
      scores: props.proposal.scores,
      scoresByStrategy: props.proposal.scores_by_strategy,
      scoresTotal: props.proposal.scores_total
    };
  }
  loadedResults.value = true;
  const [userVotesRes, votesRes] = await Promise.all([
    // Skip if user is not connected
    web3Account.value
      ? await getProposalVotes(proposalId, {
          first: 1,
          voter: web3Account.value,
          space: props.proposal.space.id
        })
      : [],
    await getProposalVotes(proposalId, {
      first: 10,
      space: props.proposal.space.id
    })
  ]);
  userVote.value = formatProposalVotes(userVotesRes)?.[0] || null;
  votes.value = formatProposalVotes(votesRes);
  loadedVotes.value = true;
}

const { loadBy, loadingMore, loadMore } = useInfiniteLoader(10);

async function loadMoreVotes() {
  const votesObj = await getProposalVotes(proposalId, {
    first: loadBy,
    skip: votes.value.length
  });
  votes.value = votes.value.concat(formatProposalVotes(votesObj));
}

function handleBackClick() {
  if (!browserHasHistory.value || browserHasHistory.value.includes('create'))
    return router.push({ name: 'spaceProposals' });
  return router.go(-1);
}

watch(web3Account, () => {
  const choice = route.query.choice as string;
  if (choice) {
    selectedChoices.value = parseInt(choice);
    clickVote();
  }
});

onMounted(async () => {
  setPageTitle('page.title.space.proposal', {
    proposal: props.proposal.title,
    space: props.space.name
  });
  const choice = route.query.choice as string;
  if (props.proposal?.type === 'approval') selectedChoices.value = [];
  if (web3Account.value && choice) {
    selectedChoices.value = parseInt(choice);
    clickVote();
  }
  loadResults();
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div class="mb-3 px-3 md:px-0">
        <ButtonBack @click="handleBackClick" />
      </div>

      <div class="px-3 md:px-0">
        <SpaceProposalHeader
          :space="space"
          :proposal="proposal"
          :is-admin="isAdmin"
        />
        <SpaceProposalContent :space="space" :proposal="proposal" />
      </div>
      <div class="space-y-4">
        <div v-if="proposal?.discussion" class="px-3 md:px-0">
          <h3 v-text="$t('discussion')" />
          <BlockLink :link="proposal.discussion" />
        </div>
        <SpaceProposalVote
          v-if="proposal?.state === 'active' && loadedVotes"
          v-model="selectedChoices"
          :proposal="proposal"
          :user-vote="userVote"
          @open="modalOpen = true"
          @clickVote="clickVote"
        />
        <SpaceProposalVotesList
          :loaded="loadedVotes"
          :space="space"
          :proposal="proposal"
          :votes="votes"
          :strategies="strategies"
          :user-vote="userVote"
          :loading-more="loadingMore"
          @loadVotes="loadMore(loadMoreVotes)"
        />
        <SpaceProposalPlugins
          v-if="proposal?.plugins && loadedResults && results"
          :id="proposalId"
          :space="space"
          :proposal="proposal"
          :results="results"
          :loaded-results="loadedResults"
          :votes="votes"
          :strategies="strategies"
        />
      </div>
    </template>
    <template #sidebar-right>
      <div class="mt-4 space-y-4 lg:mt-0">
        <SpaceProposalInformation
          :space="space"
          :proposal="proposal"
          :strategies="strategies"
        />
        <SpaceProposalResults
          :loaded="loadedResults"
          :space="space"
          :proposal="proposal"
          :results="results"
          :votes="votes"
          :strategies="strategies"
          :is-admin="isAdmin"
          @reload="reloadProposal()"
        />
        <SpaceProposalPluginsSidebar
          v-if="proposal.plugins && loadedResults && results"
          :id="proposalId"
          :space="space"
          :proposal="proposal"
          :results="results"
          :loaded-results="loadedResults"
          :votes="votes"
          :strategies="strategies"
        />
      </div>
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalVote
      :open="modalOpen"
      :space="space"
      :proposal="proposal"
      :selected-choices="selectedChoices"
      :strategies="strategies"
      @close="modalOpen = false"
      @reload="reloadProposal()"
      @openPostVoteModal="isModalPostVoteOpen = true"
    />
    <ModalTerms
      :open="modalTermsOpen"
      :space="space"
      :action="$t('modalTerms.actionVote')"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), (modalOpen = true)"
    />
    <ModalPostVote
      :open="isModalPostVoteOpen"
      :space="space"
      :proposal="proposal"
      :selected-choices="selectedChoices"
      @close="isModalPostVoteOpen = false"
    />
  </teleport>
</template>
