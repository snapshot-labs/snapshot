<script setup lang="ts">
import { ref, computed, watch, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProposal, getResults, getProposalVotes } from '@/helpers/snapshot';
import { explorerUrl, getIpfsUrl } from '@/helpers/utils';
import pending from '@/helpers/pending.json';
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import {
  useI18n,
  useModal,
  useTerms,
  useProfiles,
  useApp,
  useSharing,
  useWeb3,
  useClient,
  useInfiniteLoader,
  useProposals,
  useIntl,
  useSpaceCreateForm,
  useFlashNotification
} from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const route = useRoute();
const router = useRouter();
const { domain } = useApp();
const { t, setPageTitle } = useI18n();
const { web3, web3Account } = useWeb3();
const { send, isSending } = useClient();
const { removeSpaceProposal } = useProposals();
const { notify } = useFlashNotification();
const { formatRelativeTime, formatNumber } = useIntl();

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
const userVote = ref([]);
const results = ref<Results | null>(null);
const modalStrategiesOpen = ref(false);

const isCreator = computed(() => proposal.value?.author === web3Account.value);
const isAdmin = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});
const strategies = computed(
  // Needed for older proposal that are missing strategies
  () => proposal.value?.strategies ?? props.space.strategies
);

const symbols = computed((): string[] =>
  strategies.value.map(strategy => (strategy.params.symbol as string) || '')
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
  isModalPostVoteOpen.value = true;
  loadProposal();
}

function formatProposalVotes(votes) {
  return votes.map(vote => {
    vote.balance = vote.vp;
    vote.scores = vote.vp_by_strategy;
    return vote;
  });
}

async function loadResults() {
  if (!proposal.value) return;
  loadingResultsFailed.value = false;
  const spaceShowPending = pending;
  const showPending =
    proposal.value.scores_state === 'pending' &&
    spaceShowPending.includes(proposal.value.space.id);
  if (
    proposal.value.scores_state === 'invalid' &&
    proposal.value.state === 'closed'
  ) {
    loadingResultsFailed.value = true;
  } else if (proposal.value.scores_state === 'final' || showPending) {
    results.value = {
      scores: proposal.value.scores,
      scoresByStrategy: proposal.value.scores_by_strategy,
      scoresTotal: proposal.value.scores_total
    };
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
    userVote.value = formatProposalVotes(userVotesRes);
    votes.value = formatProposalVotes(votesRes);
    loadedVotes.value = true;
  } else {
    const votesTmp = await getProposalVotes(id);
    try {
      const resultsObj = await getResults(
        props.space,
        proposal.value,
        votesTmp
      );
      results.value = resultsObj.results;
      votes.value = resultsObj.votes;
      loadedResults.value = true;
      loadingResultsFailed.value = false;
      loadedVotes.value = true;
    } catch (e) {
      console.log(e);
      loadingResultsFailed.value = true;
    }
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
  shareToFacebook,
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
        step: 1,
        sourceProposal: proposal.value.id
      }
    });
  }
}

function selectFromShareDropdown(e) {
  if (e === 'shareProposalTwitter')
    shareProposalTwitter(props.space, proposal.value);
  else if (e === 'shareToFacebook')
    shareToFacebook(props.space, proposal.value);
  else if (e === 'shareToClipboard')
    shareToClipboard(props.space, proposal.value);
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
        <ButtonBack
          @click="
            browserHasHistory?.includes('timeline')
              ? $router.go(-1)
              : $router.push(
                  domain ? { path: '/' } : { name: 'spaceProposals' }
                )
          "
        />
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
              <BaseDropdown
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
                    v-if="item.icon"
                    :name="item.icon"
                    size="21"
                    class="mr-2 align-middle !leading-[0]"
                  />
                  {{ item.text }}
                </template>
              </BaseDropdown>
              <BaseDropdown
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
              </BaseDropdown>
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
          v-if="proposal?.state === 'active'"
          v-model="selectedChoices"
          :proposal="proposal"
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
        <PluginProposal
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
        <BaseBlock :title="$t('information')">
          <div class="space-y-1">
            <div>
              <b>{{ $t('strategies') }}</b>
              <span
                class="float-right flex text-skin-link"
                @click="modalStrategiesOpen = true"
              >
                <span
                  v-for="(symbol, symbolIndex) of symbols.slice(0, 5)"
                  :key="symbol"
                  class="flex"
                >
                  <span
                    v-tippy="{
                      content: symbol
                    }"
                  >
                    <AvatarSpace :space="space" :symbol-index="symbolIndex" />
                  </span>
                  <span
                    v-show="symbolIndex !== symbols.length - 1"
                    class="ml-1"
                  />
                </span>
              </span>
            </div>

            <div>
              <b>IPFS</b>
              <BaseLink :link="getIpfsUrl(proposal.ipfs)" class="float-right">
                #{{ proposal.ipfs.slice(0, 7) }}
              </BaseLink>
            </div>
            <div>
              <b>{{ $t('proposal.votingSystem') }}</b>
              <span class="float-right text-skin-link">
                {{ $t(`voting.${proposal.type}`) }}
              </span>
            </div>
            <div>
              <b>{{ $t('proposal.startDate') }}</b>
              <span
                v-tippy="{
                  content: formatRelativeTime(proposal.start)
                }"
                class="float-right text-skin-link"
                v-text="$d(proposal.start * 1e3, 'short', 'en-US')"
              />
            </div>
            <div>
              <b>{{ $t('proposal.endDate') }}</b>
              <span
                v-tippy="{
                  content: formatRelativeTime(proposal.end)
                }"
                class="float-right text-skin-link"
                v-text="$d(proposal.end * 1e3, 'short', 'en-US')"
              />
            </div>
            <div>
              <b>{{ $t('snapshot') }}</b>
              <BaseLink
                :link="
                  explorerUrl(proposal.network, proposal.snapshot, 'block')
                "
                class="float-right"
              >
                {{ formatNumber(Number(proposal.snapshot)) }}
              </BaseLink>
            </div>
          </div>
        </BaseBlock>
        <SpaceProposalResultsError
          v-if="loadingResultsFailed"
          :is-admin="isAdmin"
          :proposal-id="proposal.id"
          :proposal-state="proposal.scores_state"
          @retry="loadProposal()"
        />
        <ProposalResults
          :loaded="loadedResults"
          :space="space"
          :proposal="proposal"
          :results="(results as Results)"
          :strategies="strategies"
        />
        <PluginProposalSidebar
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
      :id="id"
      :open="modalOpen"
      :space="space"
      :proposal="proposal"
      :selected-choices="selectedChoices"
      :snapshot="proposal.snapshot"
      :strategies="strategies"
      @close="modalOpen = false"
      @reload="reloadProposal()"
    />
    <ModalStrategies
      :open="modalStrategiesOpen"
      :proposal="proposal"
      :strategies="strategies"
      @close="modalStrategiesOpen = false"
    />
    <ModalTerms
      :open="modalTermsOpen"
      :space="space"
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
