<script setup lang="ts">
import { ref, computed, watch, onMounted, watchEffect } from 'vue';
import voting from '@snapshot-labs/snapshot.js/src/voting';
import { useRoute, useRouter } from 'vue-router';
import { getProposal, getProposalVotes } from '@/helpers/snapshot';
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';
import {
  useI18n,
  useModal,
  useTerms,
  useWeb3,
  useInfiniteLoader
} from '@/composables';

const props = defineProps<{ space: ExtendedSpace }>();

const route = useRoute();
const router = useRouter();

const { setPageTitle } = useI18n();
const { web3, web3Account } = useWeb3();

const id: string = route.params.id as string;

const modalOpen = ref(false);
const isModalPostVoteOpen = ref(false);
const selectedChoices = ref<any>(null);
const loadingProposal = ref(true);
const loadedResults = ref(false);
const loadedVotes = ref(false);
const proposal = ref<Proposal | null>(null);
const votes = ref([]);
const userVote = ref<Vote | null>(null);
const results = ref<Results | null>(null);

const isAdmin = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});
const strategies = computed(
  // Needed for older proposal that are missing strategies
  () => proposal.value?.strategies ?? props.space.strategies
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

async function loadProposal() {
  loadingProposal.value = true;
  proposal.value = await getProposal(id);
  // Redirect to 404 page if proposal doesn't belong to current space
  if (
    !proposal.value ||
    props.space.id.toLowerCase() !== proposal.value.space.id.toLowerCase()
  ) {
    router.push({ name: 'error-404' });
  }
  loadingProposal.value = false;
  loadResults();
}

function reloadProposal() {
  loadProposal();
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
  if (!proposal.value) return;

  if (proposal.value.scores.length === 0) {
    const votingClass = new voting[proposal.value.type](
      proposal.value,
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
      scores: proposal.value.scores,
      scoresByStrategy: proposal.value.scores_by_strategy,
      scoresTotal: proposal.value.scores_total
    };
  }
  loadedResults.value = true;
  const [userVotesRes, votesRes] = await Promise.all([
    // Skip if user is not connected
    web3Account.value
      ? await getProposalVotes(id, {
          first: 1,
          voter: web3Account.value,
          space: proposal.value.space.id
        })
      : [],
    await getProposalVotes(id, {
      first: 10,
      space: proposal.value.space.id
    })
  ]);
  userVote.value = formatProposalVotes(userVotesRes)?.[0] || null;
  votes.value = formatProposalVotes(votesRes);
  loadedVotes.value = true;
}

const { loadBy, loadingMore, loadMore } = useInfiniteLoader(10);

async function loadMoreVotes() {
  const votesObj = await getProposalVotes(id, {
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
  if (proposal.value && choice) {
    selectedChoices.value = parseInt(choice);
    clickVote();
  }
});

watchEffect(() => {
  if (props.space?.name && proposal.value?.title)
    setPageTitle('page.title.space.proposal', {
      proposal: proposal.value.title,
      space: props.space.name
    });
});

onMounted(async () => {
  await loadProposal();
  const choice = route.query.choice as string;
  if (proposal.value?.type === 'approval') selectedChoices.value = [];
  if (web3Account.value && choice) {
    selectedChoices.value = parseInt(choice);
    clickVote();
  }
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div class="mb-3 px-3 md:px-0">
        <ButtonBack @click="handleBackClick" />
      </div>

      <div class="px-3 md:px-0">
        <template v-if="proposal">
          <SpaceProposalHeader
            :space="space"
            :proposal="proposal"
            :is-admin="isAdmin"
          />
          <SpaceProposalContent :space="space" :proposal="proposal" />
        </template>
        <LoadingPage v-else />
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
          v-if="proposal"
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
          :id="id"
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
      <div v-if="proposal" class="mt-4 space-y-4 lg:mt-0">
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
          :id="id"
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
  <teleport v-if="proposal" to="#modal">
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
