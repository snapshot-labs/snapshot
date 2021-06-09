<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link
          :to="{ name: domain ? 'home' : 'proposals' }"
          class="text-gray"
        >
          <Icon name="back" size="22" class="v-align-middle" />
          {{ space.name }}
        </router-link>
      </div>
      <div class="px-4 px-md-0">
        <template v-if="loaded">
          <h1 class="mb-2">
            {{ proposal.title }}
            <span v-text="`#${id.slice(0, 7)}`" class="text-gray" />
          </h1>
          <div class="mb-4">
            <UiState :state="proposal.state" />
            <UiDropdown
              top="2.2rem"
              right="1.3rem"
              class="float-right"
              v-if="isAdmin || isCreator"
              @select="selectFromDropdown"
              :items="[{ text: $t('deleteProposal'), action: 'delete' }]"
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
      <PluginSafeSnapConfig
        :preview="true"
        v-if="loadedResults && proposal.plugins?.safeSnap?.txs"
        :proposal="proposal"
        :proposalId="id"
        :moduleAddress="space.plugins?.safeSnap?.address"
        :network="space.network"
        v-model="proposal.plugins.safeSnap"
      />
    </template>
    <template #sidebar-right v-if="loaded">
      <Block :title="$t('information')">
        <div class="mb-1">
          <b>{{ $t('strategies') }}</b>
          <span
            @click="modalStrategiesOpen = true"
            class="float-right text-white a"
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
            :profile="proposal.profile"
            :space="space"
            class="float-right"
          />
        </div>
        <div class="mb-1">
          <b>IPFS</b>
          <a :href="_ipfsUrl(proposal.id)" target="_blank" class="float-right">
            #{{ proposal.id.slice(0, 7) }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
        <div class="mb-1">
          <b>{{ $t('proposal.votingSystem') }}</b>
          <span class="float-right text-white">
            {{ $t(`voting.${proposal.type}`) }}
          </span>
        </div>
        <div>
          <div class="mb-1">
            <b>{{ $t('proposal.startDate') }}</b>
            <span
              :aria-label="_ms(proposal.start)"
              v-text="$d(proposal.start * 1e3, 'short', 'en-US')"
              class="float-right text-white tooltipped tooltipped-n"
            />
          </div>
          <div class="mb-1">
            <b>{{ $t('proposal.endDate') }}</b>
            <span
              :aria-label="_ms(proposal.end)"
              v-text="$d(proposal.end * 1e3, 'short', 'en-US')"
              class="float-right text-white tooltipped tooltipped-n"
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
        :loaded="loadedResults"
        :space="space"
        :proposal="proposal"
        :results="results"
        :votes="votes"
        :strategies="strategies"
      />
      <div v-if="loadedResults">
        <PluginAragonCustomBlock
          :loaded="loadedResults"
          :id="id"
          :space="space"
          :proposal="proposal"
          :results="results"
        />
        <PluginGnosisCustomBlock
          v-if="proposal.plugins?.gnosis?.baseTokenAddress"
          :proposalConfig="proposal.plugins.gnosis"
          :choices="proposal.choices"
        />
        <PluginSafeSnapCustomBlock
          v-if="proposal.plugins?.safeSnap?.txs"
          :proposalConfig="proposal.plugins.safeSnap"
          :proposalEnd="proposal.end"
          :proposalId="id"
          :moduleAddress="space.plugins?.safeSnap?.address"
          :network="space.network"
        />
        <PluginQuorumCustomBlock
          :loaded="loadedResults"
          v-if="space.plugins?.quorum"
          :space="space"
          :proposal="proposal"
          :results="results"
          :strategies="strategies"
        />
      </div>
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

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getProposal, getResults, getPower } from '@/helpers/snapshot';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const key = route.params.key;
    const id = route.params.id;
    const ts = (Date.now() / 1e3).toFixed();

    const modalOpen = ref(false);
    const selectedChoices = ref(null);
    const loaded = ref(false);
    const loadedResults = ref(false);
    const proposal = ref({});
    const votes = ref({});
    const results = ref([]);
    const totalScore = ref(0);
    const scores = ref([]);
    const dropdownLoading = ref(false);
    const modalStrategiesOpen = ref(false);

    const space = computed(() => store.state.app.spaces[key]);
    const web3Account = computed(() => store.state.web3.account);
    const isCreator = computed(
      () => proposal.value.author === web3Account.value
    );
    const isAdmin = computed(() => {
      const admins = (space.value.admins || []).map(admin =>
        admin.toLowerCase()
      );
      return admins.includes(web3Account.value?.toLowerCase());
    });
    const strategies = computed(
      () => proposal.value.strategies ?? space.value.strategies
    );
    const symbols = computed(() =>
      strategies.value.map(strategy => strategy.params.symbol)
    );

    const { modalAccountOpen } = useModal();
    const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(key);

    function clickVote() {
      !store.state.web3.account
        ? (modalAccountOpen.value = true)
        : !termsAccepted.value && space.value.terms
        ? (modalTermsOpen.value = true)
        : (modalOpen.value = true);
    }

    async function loadProposal() {
      const proposalObj = await getProposal(space.value, id);
      proposal.value = proposalObj.proposal;
      loaded.value = true;
      const resultsObj = await getResults(
        space.value,
        proposalObj.proposal,
        proposalObj.votes,
        proposalObj.blockNumber
      );
      votes.value = resultsObj.votes;
      results.value = resultsObj.results;
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
          await store.dispatch('send', {
            space: space.value.key,
            type: 'delete-proposal',
            payload: {
              proposal: id
            }
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

    function selectFromDropdown(e) {
      if (e === 'delete') deleteProposal();
    }

    watch(web3Account, (val, prev) => {
      if (val?.toLowerCase() !== prev) loadPower();
    });

    onMounted(async () => {
      await loadProposal();
      loadPower();
    });

    return {
      key,
      id,
      ts,
      modalTermsOpen,
      acceptTerms,
      clickVote,
      modalOpen,
      space,
      selectedChoices,
      loaded,
      loadedResults,
      proposal,
      votes,
      results,
      loadProposal,
      totalScore,
      scores,
      isCreator,
      isAdmin,
      strategies,
      symbols,
      dropdownLoading,
      modalStrategiesOpen,
      selectFromDropdown
    };
  }
};
</script>
