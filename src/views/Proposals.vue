<template>
  <div>
    <Container>
      <div class="mb-3 d-flex">
        <div class="flex-auto">
          <div>
            <a
              :href="_etherscanLink(namespace.address)"
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
        <div class="px-4 py-3 bg-gray-dark overflow-auto menu-tabs">
          <div class="col-12 col-lg-7 pt-2 float-md-left">
            <a
              v-for="state in [
                'All',
                'Core',
                'Community',
                'Invalid',
                'Active',
                'Pending',
                'Closed'
              ]"
              :key="state"
              v-text="state"
              @click="selectedState = state"
              :class="selectedState !== state && 'text-gray'"
              class="mr-3 hide-sm hide-md"
            />
          </div>
          <div class="col-12 col-lg-5 float-md-right">
            <input
              class="form-control height-full input-block ml-lg-2 "
              v-model="search"
              type="text"
              placeholder="Search"
              aria-label="Search"
            />
          </div>
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
    <transition name="sliding">
      <div class="floating-filters" v-show="showMobileFilter">
        <a
          v-for="state in [
            'All',
            'Core',
            'Community',
            'Invalid',
            'Active',
            'Pending',
            'Closed'
          ]"
          :key="state"
          v-text="state"
          @click="selectedState = state"
          :class="{ active: selectedState == state }"
          class="floating-nav text-center mt-3 d-md-none"
        />
      </div>
    </transition>

    <button
      class="floater-btn d-md-none"
      @click="showMobileFilter = !showMobileFilter"
    >
      <svg
        v-if="!showMobileFilter"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 18"
        width="36"
        height="36"
      >
        <path
          d="M2.75 6a.75.75 0 000 1.5h18.5a.75.75 0 000-1.5H2.75zM6 11.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm4 4.938a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z"
        ></path>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 18"
        width="36"
        height="36"
      >
        <path
          fill-rule="evenodd"
          d="M5.72 5.72a.75.75 0 011.06 0L12 10.94l5.22-5.22a.75.75 0 111.06 1.06L13.06 12l5.22 5.22a.75.75 0 11-1.06 1.06L12 13.06l-5.22 5.22a.75.75 0 01-1.06-1.06L10.94 12 5.72 6.78a.75.75 0 010-1.06z"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import namespaces from '@/namespaces.json';
import '@primer/octicons/build/build.css';

export default {
  data() {
    return {
      loading: false,
      loaded: false,
      proposals: {},
      selectedState: 'All',
      search: '',
      showMobileFilter: false
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
            if (
              !proposal[1].msg.payload.name
                .toLowerCase()
                .includes(this.search.toLowerCase()) &&
              !proposal[1].address
                .toLowerCase()
                .includes(this.search.toLowerCase())
            ) {
              return false;
            }
            if (proposal[1].balance < this.namespace.min) return false;
            if (
              this.selectedState !== 'Invalid' &&
              this.namespace.invalid.includes(proposal[1].authorIpfsHash)
            ) {
              return false;
            }
            if (
              this.selectedState === 'Invalid' &&
              this.namespace.invalid.includes(proposal[1].authorIpfsHash)
            ) {
              return true;
            }
            if (this.selectedState === 'All') return true;
            if (
              this.selectedState === 'Active' &&
              proposal[1].msg.payload.start <= ts &&
              proposal[1].msg.payload.end > ts
            ) {
              return true;
            }
            if (
              this.selectedState === 'Core' &&
              proposal[1].address.includes(this.namespace.core)
            ) {
              return true;
            }
            if (
              this.selectedState === 'Community' &&
              !proposal[1].address.includes(this.namespace.core)
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
    this.proposals = await this.getProposals(this.namespace.address);
    this.loading = false;
    this.loaded = true;
  }
};
</script>
<style>
.sliding-enter-active,
.sliding-leave-active {
  transition: all 0.2s;
}

.sliding-enter,
.sliding-leave-to {
  opacity: 0;
  transform: translateY(70px);
}
</style>
