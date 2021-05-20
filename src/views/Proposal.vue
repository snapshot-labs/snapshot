<template>
  <Layout>
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
        <template v-if="loadedProposal">
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
      <Block
        v-if="loadedProposal && ts >= proposal.start && ts < proposal.end"
        class="mb-4"
        :title="$t('proposal.castVote')"
      >
        <div class="mb-3">
          <UiButton
            v-for="(choice, i) in proposal.choices"
            :key="i"
            @click="selectedChoice = i + 1"
            class="d-block width-full mb-2"
            :class="selectedChoice === i + 1 && 'button--active'"
          >
            {{ _shorten(choice, 32) }}
            <a
              v-if="proposal.plugins?.aragon?.[`choice${[i + 1]}`]"
              @click="modalOpen = true"
              :aria-label="`Target address: ${
                proposal.plugins.aragon[`choice${i + 1}`].actions[0].to
              }\nValue: ${
                proposal.plugins.aragon[`choice${i + 1}`].actions[0].value
              }\nData: ${
                proposal.plugins.aragon[`choice${i + 1}`].actions[0].data
              }`"
              class="tooltipped tooltipped-n break-word"
            >
              <Icon name="warning" class="v-align-middle ml-1" />
            </a>
          </UiButton>
        </div>
        <UiButton
          :disabled="voteLoading || app.authLoading || !selectedChoice"
          :loading="voteLoading"
          @click="clickVote"
          class="d-block width-full button--submit"
        >
          {{ $t('proposal.vote') }}
        </UiButton>
      </Block>
      <BlockVotes
        v-if="loadedProposal"
        :loaded="loadedResults"
        :space="space"
        :proposal="proposal"
        :votes="votes"
        :strategies="strategies"
      />
    </template>
    <template #sidebar-right v-if="loadedProposal">
      <Block :title="$t('information')">
        <div class="mb-1">
          <b>{{ $t('strategies') }}</b>
          <span
            @click="modalStrategiesOpen = true"
            class="float-right text-white a"
          >
            <span v-for="(symbol, symbolIndex) of symbols" :key="symbol">
              <span :aria-label="symbol" class="tooltipped tooltipped-n">
                <Token :space="space.id" :symbolIndex="symbolIndex" />
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
        :id="id"
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
        <PluginDaoModuleCustomBlock
          v-if="proposal.plugins?.daoModule?.txs"
          :proposalConfig="proposal.plugins.daoModule"
          :proposalEnd="proposal.end"
          :porposalId="id"
          :moduleAddress="space.plugins?.daoModule?.address"
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
      v-if="loadedProposal"
      :open="modalOpen"
      @close="modalOpen = false"
      @reload="loadProposal"
      :space="space"
      :proposal="proposal"
      :id="id"
      :selectedChoice="selectedChoice"
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
import { ref, computed, watch } from 'vue';
import { mapActions } from 'vuex';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { getProposal, getResults, getPower } from '@/helpers/snapshot';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';

export default {
  setup() {
    const route = useRoute();
    const store = useStore();
    const key = route.params.key;
    const id = route.params.id;

    const web3Account = computed(() => store.state.web3.account);

    const modalOpen = ref(false);
    const proposal = ref({});
    const votes = ref({});
    const results = ref([]);
    const space = ref({});
    const loadedProposal = ref(false);
    const loadedResults = ref(false);
    const totalScore = ref(0);
    const scores = ref([]);

    const { modalAccountOpen } = useModal();
    const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(key);

    function clickVote() {
      !store.state.web3.account
        ? (modalAccountOpen.value = true)
        : !termsAccepted.value && space.value.terms
        ? (modalTermsOpen.value = true)
        : (modalOpen.value = true);
    }

    async function loadPower() {
      if (!web3Account.value || !proposal.value.author) return;
      const powerData = await getPower(
        space.value,
        web3Account.value,
        proposal.value
      );
      totalScore.value = powerData.totalScore;
      scores.value = powerData.scores;
    }

    async function loadProposal() {
      const proposalData = await getProposal(id, key);
      proposal.value = proposalData.proposal;
      space.value = proposalData.space;
      loadedProposal.value = true;
      const resultsRes = await getResults(
        space.value,
        proposalData.proposal,
        proposalData.votes,
        proposalData.blockNumber
      );
      votes.value = resultsRes.votes;
      results.value = resultsRes.results;
      loadedResults.value = true;
      loadPower();
    }

    watch(web3Account, (newValues, prevValues) => {
      if (newValues?.toLowerCase() !== prevValues) loadPower();
    });

    loadProposal();

    return {
      key,
      id,
      modalTermsOpen,
      acceptTerms,
      clickVote,
      modalOpen,
      space,
      proposal,
      votes,
      results,
      loadedProposal,
      loadedResults,
      loadProposal,
      totalScore,
      scores
    };
  },
  data() {
    return {
      voteLoading: false,
      dropdownLoading: false,
      modalStrategiesOpen: false,
      selectedChoice: 0
    };
  },
  computed: {
    ts() {
      return (Date.now() / 1e3).toFixed();
    },
    symbols() {
      return this.strategies.map(strategy => strategy.params.symbol);
    },
    isCreator() {
      return this.proposal.author === this.web3.account;
    },
    isAdmin() {
      const admins = (this.space.admins || []).map(admin =>
        admin.toLowerCase()
      );
      return admins.includes(this.web3.account?.toLowerCase());
    },
    strategies() {
      return this.proposal.strategies ?? this.space.strategies;
    }
  },
  methods: {
    ...mapActions(['send']),
    async deleteProposal() {
      this.dropdownLoading = true;
      try {
        if (
          await this.send({
            space: this.space.id,
            type: 'delete-proposal',
            payload: {
              proposal: this.id
            }
          })
        ) {
          this.dropdownLoading = false;
          this.$router.push({
            name: 'proposals'
          });
        }
      } catch (e) {
        console.error(e);
      }
      this.dropdownLoading = false;
    },
    selectFromDropdown(e) {
      if (e === 'delete') this.deleteProposal();
    }
  }
};
</script>
