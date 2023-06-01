<script setup lang="ts">
import voting from '@snapshot-labs/snapshot.js/src/voting';
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const props = defineProps<{ space: ExtendedSpace; proposal: Proposal }>();
const emit = defineEmits(['reload-proposal']);

useMeta({
  title: {
    key: 'metaInfo.space.proposal.title',
    params: {
      space: props.space.name,
      proposal: props.proposal.title
    }
  },
  description: {
    key: 'metaInfo.space.proposal.description',
    params: {
      body: props.proposal.body.slice(0, 160)
    }
  }
});

const route = useRoute();
const router = useRouter();
const { web3, web3Account } = useWeb3();
const { isMessageVisible, setMessageVisibility } = useFlaggedMessageStatus(
  route.params.id as string
);

const proposalId: string = route.params.id as string;

const modalOpen = ref(false);
const selectedChoices = ref<any>(null);
const loadedResults = ref(false);
const results = ref<Results | null>(null);

const isAdmin = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});

const isModerator = computed(() => {
  const moderators = (props.space.moderators || []).map(moderator =>
    moderator.toLowerCase()
  );
  return moderators.includes(web3Account.value?.toLowerCase());
});

const strategies = computed(
  // Needed for older proposal that are missing strategies
  () => props.proposal?.strategies ?? props.space.strategies
);

const browserHasHistory = computed(() => window.history.state.back);

const { modalAccountOpen, isModalPostVoteOpen } = useModal();
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
}

function handleBackClick() {
  if (!browserHasHistory.value || browserHasHistory.value.includes('create'))
    return router.push({ name: 'spaceProposals' });
  return router.go(-1);
}

function handleChoiceQuery() {
  const choice = route.query.choice as string;
  if (web3Account.value && choice && props.proposal.state === 'active') {
    selectedChoices.value = parseInt(choice);
    clickVote();
  }
}

watch(
  web3Account,
  () => {
    handleChoiceQuery();
  },
  { immediate: true }
);

onMounted(() => {
  loadResults();
});

onMounted(() => setMessageVisibility(props.proposal.flagged));
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div class="mb-3 px-3 md:px-0">
        <ButtonBack @click="handleBackClick" />
      </div>

      <MessageWarningFlagged
        v-if="isMessageVisible"
        type="proposal"
        responsive
        @forceShow="setMessageVisibility(false)"
      />

      <template v-else>
        <div class="px-3 md:px-0">
          <SpaceProposalHeader
            :space="space"
            :proposal="proposal"
            :is-admin="isAdmin"
            :is-moderator="isModerator"
          />
          <SpaceProposalContent :space="space" :proposal="proposal" />
        </div>
        <div class="space-y-4">
          <div v-if="proposal?.discussion" class="px-3 md:px-0">
            <h3 v-text="$t('discussion')" />
            <BlockLink
              :link="proposal.discussion"
              data-testid="proposal-page-discussion-link"
            />
          </div>
          <SpaceProposalVote
            v-if="proposal?.state === 'active'"
            v-model="selectedChoices"
            :proposal="proposal"
            @open="modalOpen = true"
            @clickVote="clickVote"
          />
          <SpaceProposalVotesList :space="space" :proposal="proposal" />
          <SpaceProposalPlugins
            v-if="proposal?.plugins && loadedResults && results"
            :id="proposalId"
            :space="space"
            :proposal="proposal"
            :results="results"
            :loaded-results="loadedResults"
            :strategies="strategies"
          />
        </div>
      </template>
    </template>
    <template #sidebar-right>
      <div v-if="!isMessageVisible" class="mt-4 space-y-4 lg:mt-0">
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
