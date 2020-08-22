<template>
  <div>
    <Container>
      <div class="mb-3 d-flex">
        <div class="flex-auto">
          <div>
            <a
              :href="_etherscanLink(namespace.token)"
              target="_blank"
              class="text-gray"
            >
              {{ namespace.name || _shorten(key) }}
              <Icon name="external-link" class="ml-1" />
            </a>
          </div>
          <div class="d-flex flex-items-center flex-auto">
            <h2 class="mr-2">
              Proposals
              <UiCounter :counter="totalProposals" class="ml-1" />
            </h2>
          </div>
        </div>
        <router-link v-if="web3.account" :to="{ name: 'create' }">
          <UiButton>New proposal</UiButton>
        </router-link>
      </div>
    </Container>
    <Container :slim="true">
      <Block :slim="true">
        <div class="px-4 py-3 bg-gray-dark">
          <a
            v-for="state in ['All', 'Active', 'Pending', 'Closed']"
            :key="state"
            v-text="state"
            @click="selectedState = state"
            :class="selectedState !== state && 'text-gray'"
            class="mr-3"
          />
        </div>
        <RowLoading v-if="loading" />
        <div v-if="loaded">
          <RowProposal
            v-for="(proposal, i) in proposalsWithFilter"
            :key="i"
            :proposal="proposal"
            :token="key"
            :verified="namespace.verified"
            :i="i"
          />
        </div>
        <p
          v-if="loaded && Object.keys(proposalsWithFilter).length === 0"
          class="p-4 m-0 border-top d-block"
        >
          There isn't any proposal here yet!
        </p>
      </Block>
    </Container>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import namespaces from '@/namespaces.json';

export default {
  data() {
    return {
      loading: false,
      loaded: false,
      proposals: {},
      selectedState: 'All'
    };
  },
  computed: {
    key() {
      return this.$route.params.key;
    },
    namespace() {
      return namespaces[this.key]
        ? namespaces[this.key]
        : { token: this.key, verified: [] };
    },
    totalProposals() {
      return Object.keys(this.proposals).length;
    },
    proposalsWithFilter() {
      const ts = (Date.now() / 1e3).toFixed();
      if (this.totalProposals === 0) return {};
      return Object.fromEntries(
        Object.entries(this.proposals)
          .filter(proposal => {
            if (this.selectedState === 'All') return true;
            if (
              this.selectedState === 'Active' &&
              proposal[1].msg.payload.start <= ts &&
              proposal[1].msg.payload.end > ts
            ) {
              return true;
            }
            if (
              this.selectedState === 'Closed' &&
              proposal[1].msg.payload.end <= ts
            ) {
              return true;
            }
            if (
              this.selectedState === 'Pending' &&
              proposal[1].msg.payload.start > ts
            ) {
              return true;
            }
          })
          .sort((a, b) => b[1].msg.payload.end - a[1].msg.payload.end, 0)
      );
    }
  },
  methods: {
    ...mapActions(['getProposals'])
  },
  async created() {
    this.loading = true;
    this.proposals = await this.getProposals(this.namespace.token);
    this.loading = false;
    this.loaded = true;
  }
};
</script>
