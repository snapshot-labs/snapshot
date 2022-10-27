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
  useProfiles,
  useSharing,
  useWeb3,
  useClient,
  useInfiniteLoader,
  useProposals,
  useSpaceCreateForm,
  useFlashNotification
} from '@/composables';

const props = defineProps<{ space: ExtendedSpace }>();

const route = useRoute();
const router = useRouter();

const { t, setPageTitle } = useI18n();
const { web3, web3Account } = useWeb3();
const { send, isSending } = useClient();
const { removeSpaceProposal } = useProposals();
const { notify } = useFlashNotification();

const id: string = route.params.id as string;

const modalOpen = ref(false);
const isModalPostVoteOpen = ref(false);
const selectedChoices = ref<any>(null);
const loadingProposal = ref(true);
const loadedResults = ref(false);
const loadingResultsFailed = ref(false);
const loadedVotes = ref(false);
const proposal = ref<Proposal | null>(null);
const votes = ref([]);
const userVote = ref<Vote | null>(null);
const results = ref<Results | null>(null);

const isCreator = computed(() => proposal.value?.author === web3Account.value);
const isAdmin = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});
const strategies = computed(
  // Needed for older proposal that are missing strategies
  () => proposal.value?.strategies ?? props.space.strategies
);

const threeDotItems = computed(() => {
  const items = [{ text: t('duplicateProposal'), action: 'duplicate' }];
  if (isAdmin.value || isCreator.value)
    items.push({ text: t('deleteProposal'), action: 'delete' });
  return items;
});

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
  if (!proposal.value || props.space.id !== proposal.value.space.id) {
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
  loadingResultsFailed.value = false;
  if (
    proposal.value.scores_state === 'invalid' &&
    proposal.value.state === 'closed'
  ) {
    loadingResultsFailed.value = true;
  } else {
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
    loadingResultsFailed.value = false;
    const [userVotesRes, votesRes] = await Promise.all([
      await getProposalVotes(id, {
        first: 1,
        voter: web3Account.value
      }),
      await getProposalVotes(id, {
        first: 10
      })
    ]);
    userVote.value = formatProposalVotes(userVotesRes)?.[0] || null;
    votes.value = formatProposalVotes(votesRes);
    loadedVotes.value = true;
  }
}

const { loadBy, loadingMore, loadMore } = useInfiniteLoader(10);

async function loadMoreVotes() {
  const votesObj = await getProposalVotes(id, {
    first: loadBy,
    skip: votes.value.length
  });
  votes.value = votes.value.concat(formatProposalVotes(votesObj));
}

async function deleteProposal() {
  const result = await send(props.space, 'delete-proposal', {
    proposal: proposal.value
  });
  console.log('Result', result);
  if (result.id) {
    removeSpaceProposal(id);
    notify(['green', t('notify.proposalDeleted')]);
    router.push({ name: 'spaceProposals' });
  }
}

const {
  shareProposalTwitter,
  shareToClipboard,
  shareProposal,
  sharingIsSupported,
  sharingItems
} = useSharing();

const { resetForm } = useSpaceCreateForm();

function selectFromThreedotDropdown(e) {
  if (!proposal.value) return;
  if (e === 'delete') deleteProposal();
  if (e === 'duplicate') {
    resetForm();
    router.push({
      name: 'spaceCreate',
      params: {
        key: proposal.value.space.id,
        step: 0,
        sourceProposal: proposal.value.id
      }
    });
  }
}

function selectFromShareDropdown(e) {
  if (e === 'shareProposalTwitter')
    shareProposalTwitter(props.space, proposal.value);
  else if (e === 'shareToClipboard')
    shareToClipboard(props.space, proposal.value);
}

function handleBackClick() {
  if (!browserHasHistory.value || browserHasHistory.value.includes('create'))
    return router.push({ name: 'spaceProposals' });
  return router.go(-1);
}

const { profiles, loadProfiles } = useProfiles();

watch(proposal, () => {
  if (!proposal.value) return;
  loadProfiles([proposal.value.author]);
});

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

const showFullMarkdownBody = ref(false);

// Scroll to top of the page after clicking "Show less" button
watch(showFullMarkdownBody, () => {
  if (!showFullMarkdownBody.value) window.scrollTo(0, 0);
});

// Ref to the proposal body element
const markdownBody = ref<HTMLElement | null>(null);

// Detect if the proposal body is too long and should be shortened
const truncateMarkdownBody = computed(() => {
  const markdownBodyHeight = markdownBody.value?.clientHeight
    ? markdownBody.value.clientHeight
    : 0;
  return markdownBodyHeight > 400 ? true : false;
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
          <h1
            class="mb-3 break-words text-xl leading-8 sm:text-2xl"
            v-text="proposal.title"
          />

          <div class="mb-4 flex flex-col sm:flex-row sm:space-x-1">
            <div class="mb-1 flex items-center sm:mb-0">
              <LabelProposalState :state="proposal.state" class="mr-2" />
              <router-link
                class="group text-skin-text"
                :to="{
                  name: 'spaceProposals',
                  params: { key: space.id }
                }"
              >
                <div class="flex items-center">
                  <AvatarSpace :space="space" size="28" />
                  <span
                    class="ml-2 group-hover:text-skin-link"
                    v-text="space.name"
                  />
                </div>
              </router-link>
            </div>
            <div class="flex grow items-center space-x-1">
              <span v-text="$t('proposalBy')" />
              <BaseUser
                :address="proposal.author"
                :profile="profiles[proposal.author]"
                :space="space"
                :proposal="proposal"
                hide-avatar
              />
              <ButtonShare
                v-if="sharingIsSupported"
                @click="shareProposal(space, proposal)"
              />
              <BaseMenu
                v-else
                class="!ml-auto pl-3"
                :items="sharingItems"
                @select="selectFromShareDropdown"
              >
                <template #button>
                  <ButtonShare />
                </template>
                <template #item="{ item }">
                  <BaseIcon
                    v-if="item.extras.icon"
                    :name="item.extras.icon"
                    size="21"
                    class="mr-2 align-middle !leading-[0]"
                  />
                  {{ item.text }}
                </template>
              </BaseMenu>
              <BaseMenu
                class="md:ml-2"
                :items="threeDotItems"
                @select="selectFromThreedotDropdown"
              >
                <template #button>
                  <div>
                    <BaseButtonIcon :loading="isSending">
                      <i-ho-dots-horizontal />
                    </BaseButtonIcon>
                  </div>
                </template>
              </BaseMenu>
            </div>
          </div>

          <div v-if="proposal.body.length" class="relative">
            <div
              v-if="!showFullMarkdownBody && truncateMarkdownBody"
              class="absolute bottom-0 h-[80px] w-full bg-gradient-to-t from-skin-bg"
            />
            <div
              v-if="truncateMarkdownBody"
              class="absolute flex w-full justify-center"
              :class="{
                '-bottom-[64px]': showFullMarkdownBody,
                '-bottom-[14px]': !showFullMarkdownBody
              }"
            >
              <BaseButton
                class="z-10 !bg-skin-bg"
                @click="showFullMarkdownBody = !showFullMarkdownBody"
              >
                {{
                  showFullMarkdownBody
                    ? $t('proposals.showLess')
                    : $t('proposals.showMore')
                }}
              </BaseButton>
            </div>
            <div
              class="overflow-hidden"
              :class="{
                'h-[420px]': !showFullMarkdownBody && truncateMarkdownBody,
                'mb-[92px]': showFullMarkdownBody,
                'mb-[56px]': !showFullMarkdownBody
              }"
            >
              <div ref="markdownBody">
                <BaseMarkdown :body="proposal.body" />
              </div>
            </div>
          </div>
        </template>
        <LoadingPage v-else />
      </div>
      <div class="space-y-4">
        <SpaceProposalDiscussionLink
          v-if="proposal?.discussion"
          class="px-3 md:px-0"
          :discussion-link="proposal.discussion"
        />
        <SpaceProposalVote
          v-if="proposal?.state === 'active' && loadedVotes"
          v-model="selectedChoices"
          :proposal="proposal"
          :user-vote="userVote"
          @open="modalOpen = true"
          @clickVote="clickVote"
        />
        <SpaceProposalVotesList
          v-if="proposal && !loadingResultsFailed"
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
        <SpaceProposalResultsError
          v-if="loadingResultsFailed"
          :is-admin="isAdmin"
          :proposal-id="proposal.id"
          :proposal-state="proposal.scores_state"
          @retry="loadProposal()"
        />
        <SpaceProposalResults
          :loaded="loadedResults"
          :space="space"
          :proposal="proposal"
          :results="results"
          :votes="votes"
          :strategies="strategies"
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
    <ModalConfirm
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
