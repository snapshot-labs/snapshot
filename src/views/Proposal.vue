<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProposal, getResults, getPower } from '@/helpers/snapshot';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';
import { useProfiles } from '@/composables/useProfiles';
import { useDomain } from '@/composables/useDomain';
import { useSharing } from '@/composables/useSharing';
import { useI18n } from 'vue-i18n';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useClient } from '@/composables/useClient';

const route = useRoute();
const router = useRouter();
const key = route.params.key;
const id = route.params.id;
const { domain } = useDomain();
const { t } = useI18n();
const { spaces } = useApp();
const { web3 } = useWeb3();
const { send } = useClient();

const modalOpen = ref(false);
const selectedChoices = ref(null);
const loaded = ref(false);
const loadedResults = ref(false);
const proposal = ref({});
const votes = ref([]);
const results = ref({});
const totalScore = ref(0);
const scores = ref([]);
const dropdownLoading = ref(false);
const modalStrategiesOpen = ref(false);

const space = computed(() => spaces.value[key]);
const web3Account = computed(() => web3.value.account);
const isCreator = computed(() => proposal.value.author === web3Account.value);
const isAdmin = computed(() => {
  const admins = (space.value.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});
const strategies = computed(
  () => proposal.value.strategies ?? space.value.strategies
);
const symbols = computed(() =>
  strategies.value.map(strategy => strategy.params.symbol)
);
const threeDotItems = computed(() => {
  const items = [{ text: t('duplicateProposal'), action: 'duplicate' }];
  if (isAdmin.value || isCreator.value)
    items.push({ text: t('deleteProposal'), action: 'delete' });
  return items;
});

const safeSnapInput = computed({
  get: () => proposal.value?.plugins?.safeSnap,
  set: value => (proposal.value.plugins.safeSnap = value)
});

const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(key);

function clickVote() {
  !web3.value.account
    ? (modalAccountOpen.value = true)
    : !termsAccepted.value && space.value.terms
    ? (modalTermsOpen.value = true)
    : (modalOpen.value = true);
}

async function loadProposal() {
  const proposalObj = await getProposal(id);
  proposal.value = proposalObj.proposal;
  loaded.value = true;
  const resultsObj = await getResults(
    space.value,
    proposalObj.proposal,
    proposalObj.votes
  );
  results.value = resultsObj.results;
  votes.value = resultsObj.votes;
  loadedResults.value = true;
}

async function loadPower() {
  if (!web3Account.value || !proposal.value.author) return;
  const response = await getPower(
    space.value,
    web3Account.value,
    proposal.value
  );
  totalScore.value = response.totalScore;
  scores.value = response.scores;
}

async function deleteProposal() {
  dropdownLoading.value = true;
  try {
    if (
      await send(space.value.key, 'delete-proposal', {
        proposal: id
      })
    ) {
      dropdownLoading.value = false;
      router.push({
        name: 'proposals'
      });
    }
  } catch (e) {
    console.error(e);
  }
  dropdownLoading.value = false;
}

const {
  shareToTwitter,
  shareToFacebook,
  shareToClipboard,
  startShare,
  sharingIsSupported,
  sharingItems
} = useSharing();

function selectFromThreedotDropdown(e) {
  if (e === 'delete') deleteProposal();
  if (e === 'duplicate')
    router.push({
      name: 'create',
      params: {
        key: proposal.value.space.id,
        from: proposal.value.id
      }
    });
}

function selectFromShareDropdown(e) {
  if (e === 'shareToTwitter')
    shareToTwitter(space.value, proposal.value, window);
  else if (e === 'shareToFacebook')
    shareToFacebook(space.value, proposal.value, window);
  else if (e === 'shareToClipboard')
    shareToClipboard(space.value, proposal.value);
}

const { profiles, addressArray } = useProfiles();

watch(proposal, () => {
  addressArray.value = [proposal.value.author];
});

watch(web3Account, (val, prev) => {
  if (val?.toLowerCase() !== prev) loadPower();
});

onMounted(async () => {
  await loadProposal();
  loadPower();
});
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link
          :to="{ name: domain ? 'home' : 'proposals' }"
          class="text-color"
        >
          <Icon name="back" size="22" class="v-align-middle" />
          {{ space.name }}
        </router-link>
      </div>
      <div class="px-4 px-md-0">
        <template v-if="loaded">
          <h1 v-text="proposal.title" class="mb-2" />
          <div class="mb-4">
            <UiState :state="proposal.state" />
            <UiDropdown
              top="2.5rem"
              right="1.5rem"
              class="float-right mr-2"
              @select="selectFromShareDropdown"
              @clickedNoDropdown="startShare(space, proposal)"
              :items="sharingItems"
              :hideDropdown="sharingIsSupported"
            >
              <div class="pr-1" style="user-select: none">
                <Icon name="upload" size="25" class="v-align-text-bottom" />
                Share
              </div>
            </UiDropdown>
            <UiDropdown
              top="2.5rem"
              right="1.3rem"
              class="float-right mr-2"
              @select="selectFromThreedotDropdown"
              :items="threeDotItems"
            >
              <div class="pr-3">
                <UiLoading v-if="dropdownLoading" />
                <Icon
                  v-else
                  name="threedots"
                  size="25"
                  class="v-align-text-bottom"
                />
              </div>
            </UiDropdown>
          </div>
          <UiMarkdown :body="proposal.body" class="mb-6" />
        </template>
        <PageLoading v-else />
      </div>
      <BlockCastVote
        v-if="loaded && proposal.state === 'active'"
        :proposal="proposal"
        v-model="selectedChoices"
        @open="modalOpen = true"
        @clickVote="clickVote"
      />
      <BlockVotes
        v-if="loaded"
        :loaded="loadedResults"
        :space="space"
        :proposal="proposal"
        :votes="votes"
        :strategies="strategies"
      />
      <ProposalPluginsContent
        v-model:safeSnapInput="safeSnapInput"
        :id="id"
        :space="space"
        :proposal="proposal"
        :loadedResults="loadedResults"
      />
    </template>
    <template #sidebar-right v-if="loaded">
      <Block :title="$t('information')">
        <div class="mb-1">
          <b>{{ $t('strategies') }}</b>
          <span
            @click="modalStrategiesOpen = true"
            class="float-right link-color a"
          >
            <span v-for="(symbol, symbolIndex) of symbols" :key="symbol">
              <span :aria-label="symbol" class="tooltipped tooltipped-n">
                <Token :space="space" :symbolIndex="symbolIndex" />
              </span>
              <span v-show="symbolIndex !== symbols.length - 1" class="ml-1" />
            </span>
          </span>
        </div>
        <div class="mb-1">
          <b>{{ $t('author') }}</b>
          <User
            :address="proposal.author"
            :profile="profiles[proposal.author]"
            :space="space"
            class="float-right"
          />
        </div>
        <div class="mb-1">
          <b>IPFS</b>
          <a :href="_getUrl(proposal.id)" target="_blank" class="float-right">
            #{{ proposal.id.slice(0, 7) }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
        <div class="mb-1">
          <b>{{ $t('proposal.votingSystem') }}</b>
          <span class="float-right link-color">
            {{ $t(`voting.${proposal.type}`) }}
          </span>
        </div>
        <div>
          <div class="mb-1">
            <b>{{ $t('proposal.startDate') }}</b>
            <span
              :aria-label="_ms(proposal.start)"
              v-text="$d(proposal.start * 1e3, 'short', 'en-US')"
              class="float-right link-color tooltipped tooltipped-n"
            />
          </div>
          <div class="mb-1">
            <b>{{ $t('proposal.endDate') }}</b>
            <span
              :aria-label="_ms(proposal.end)"
              v-text="$d(proposal.end * 1e3, 'short', 'en-US')"
              class="float-right link-color tooltipped tooltipped-n"
            />
          </div>
          <div class="mb-1">
            <b>{{ $t('snapshot') }}</b>
            <a
              :href="_explorer(space.network, proposal.snapshot, 'block')"
              target="_blank"
              class="float-right"
            >
              {{ _n(proposal.snapshot, '0,0') }}
              <Icon name="external-link" class="ml-1" />
            </a>
          </div>
        </div>
      </Block>
      <BlockResults
        :id="id"
        :loaded="loadedResults"
        :space="space"
        :proposal="proposal"
        :results="results"
        :votes="votes"
        :strategies="strategies"
      />
      <ProposalPluginsSidebar
        v-if="loadedResults"
        :id="id"
        :space="space"
        :proposal="proposal"
        :results="results"
        :votes="votes"
        :strategies="strategies"
        :loadedResults="loadedResults"
      />
    </template>
  </Layout>
  <teleport to="#modal">
    <ModalConfirm
      v-if="loaded"
      :open="modalOpen"
      @close="modalOpen = false"
      @reload="loadProposal"
      :space="space"
      :proposal="proposal"
      :id="id"
      :selectedChoices="selectedChoices"
      :totalScore="totalScore"
      :scores="scores"
      :snapshot="proposal.snapshot"
      :strategies="strategies"
    />
    <ModalStrategies
      :open="modalStrategiesOpen"
      @close="modalStrategiesOpen = false"
      :space="space"
      :strategies="strategies"
    />
    <ModalTerms
      :open="modalTermsOpen"
      :space="space"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), (modalOpen = true)"
    />
  </teleport>
</template>
