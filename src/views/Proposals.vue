<template>
  <div>
    <Container>
      <div class="mb-3 d-flex">
        <div class="flex-auto">
          <div v-text="space.name" />
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
        <div
          class="px-4 py-3 bg-gray-dark overflow-auto menu-tabs rounded-top-0 rounded-md-top-2"
        >
          <div class="col-12 col-md-7 float-md-left">
            <router-link
              v-for="state in states"
              :key="state"
              v-text="state"
              :to="`/${key}/${state}`"
              :class="selectedState === state && 'text-white'"
              class="mr-3 text-gray tab"
            />
          </div>
          <transition name="bounce">
            <div v-if="showMobileFilter" class="col-12 hide-lg hide-xl pt-2 ">
              <input
                class="form-control height-full input-block ml-lg-2 "
                v-model="search"
                type="text"
                placeholder="Search"
                aria-label="Search"
              />
            </div>
          </transition>

          <div class="col-5 float-right hide-sm hide-md ">
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
            :space="space"
            :token="key"
            :verified="space.verified"
            :i="i"
          />
        </div>
        <p
          v-if="loaded && Object.keys(proposalsWithFilter).length === 0"
          class="p-4 m-0 border-top d-block"
        >
          There aren't any proposals here yet!
        </p>
      </Block>
    </Container>

    <button
      class="floater-btn d-md-none"
      @click="showMobileFilter = !showMobileFilter"
    >
      <svg
        v-if="!showMobileFilter"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 14"
        width="24"
        height="24"
      >
        <path
          fill-rule="evenodd"
          d="M14.53 15.59a8.25 8.25 0 111.06-1.06l5.69 5.69a.75.75 0 11-1.06 1.06l-5.69-5.69zM2.5 9.25a6.75 6.75 0 1111.74 4.547.746.746 0 00-.443.442A6.75 6.75 0 012.5 9.25z"
        ></path>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 14"
        width="24"
        height="24"
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
import '@primer/octicons/build/build.css';

export default {
  data() {
    return {
      loading: false,
      loaded: false,
      proposals: {},
      search: '',
      showMobileFilter: false
    };
  },
  computed: {
    key() {
      return this.$route.params.key;
    },
    space() {
      return this.web3.spaces[this.key];
    },
    states() {
      const states = [
        'all',
        'core',
        'community',
        'active',
        'pending',
        'closed'
      ];
      return this.space.showOnlyCore
        ? states.filter(state => !['core', 'community'].includes(state))
        : states;
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

            if (
              this.space.showOnlyCore &&
              !this.space.core.includes(proposal[1].address)
            )
              return false;

            if (
              ['core', 'all'].includes(this.selectedState) &&
              this.space.core.includes(proposal[1].address)
            )
              return true;

            if (
              proposal[1].score < this.space.min ||
              this.space.invalid.includes(proposal[1].authorIpfsHash)
            )
              return false;

            if (
              this.selectedState === 'invalid' &&
              this.space.invalid.includes(proposal[1].authorIpfsHash)
            )
              return true;

            if (this.selectedState === 'all') return true;

            if (
              this.selectedState === 'active' &&
              proposal[1].msg.payload.start <= ts &&
              proposal[1].msg.payload.end > ts
            )
              return true;

            if (
              this.selectedState === 'community' &&
              !this.space.core.includes(proposal[1].address)
            )
              return true;

            if (
              this.selectedState === 'closed' &&
              proposal[1].msg.payload.end <= ts
            )
              return true;

            if (
              this.selectedState === 'pending' &&
              proposal[1].msg.payload.start > ts
            )
              return true;
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
    this.selectedState = this.$route.params.tab || this.space.defaultView;
    this.proposals = await this.getProposals(this.space);
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
