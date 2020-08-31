<template>
  <div>
    <Container>
      <div class="mb-3 d-flex">
        <div class="flex-auto">
          <div v-text="namespace.name" />
          <div class="d-flex flex-items-center flex-auto">
            <h2 class="mr-2">
              Proposals
              <UiCounter :counter="totalProposals" class="ml-1" />
            </h2>
          </div>
        </div>
        <router-link v-if="$auth.isAuthenticated" :to="{ name: 'create' }">
          <UiButton>New proposal</UiButton>
        </router-link>
      </div>
    </Container>
    <Container :slim="true">
      <Block :slim="true">
        <div class="px-4 py-3 bg-gray-dark overflow-auto menu-tabs">
          <router-link
            v-for="state in [
              'core',
              'community',
              'all',
              'active',
              'pending',
              'invalid',
              'closed'
            ]"
            :key="state"
            v-text="state"
            :to="`/${key}/${state}`"
            :class="selectedState === state && 'text-white'"
            class="mr-3 text-gray tab"
          />
        </div>
        <RowLoading v-if="loading" />
        <div v-if="loaded">
          <RowProposal
            v-for="(proposal, i) in proposalsWithFilter"
            :key="i"
            :proposal="proposal"
            :namespace="namespace"
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
            if (proposal[1].balance < this.namespace.min) return false;
            if (
              this.selectedState !== 'invalid' &&
              this.namespace.invalid.includes(proposal[1].authorIpfsHash)
            ) {
              return false;
            }
            if (
              this.selectedState === 'invalid' &&
              this.namespace.invalid.includes(proposal[1].authorIpfsHash)
            ) {
              return true;
            }
            if (this.selectedState === 'all') return true;
            if (
              this.selectedState === 'active' &&
              proposal[1].msg.payload.start <= ts &&
              proposal[1].msg.payload.end > ts
            ) {
              return true;
            }
            if (
              this.selectedState === 'core' &&
              this.namespace.core.includes(proposal[1].address)
            ) {
              return true;
            }
            if (
              this.selectedState === 'community' &&
              !this.namespace.core.includes(proposal[1].address)
            ) {
              return true;
            }
            if (
              this.selectedState === 'closed' &&
              proposal[1].msg.payload.end <= ts
            ) {
              return true;
            }
            if (
              this.selectedState === 'pending' &&
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
    this.selectedState = this.$route.params.tab || this.namespace.defaultView;
    this.proposals = await this.getProposals(this.namespace.address);
    this.loading = false;
    this.loaded = true;
  }
};
</script>
