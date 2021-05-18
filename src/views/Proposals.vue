<template>
  <div>
    <Container>
      <div class="mb-3 d-flex">
        <div class="flex-auto">
          <div v-text="space.name" />
          <div class="d-flex flex-items-center flex-auto">
            <h2 class="mr-2">
              Proposals
              <UiCounter
                :counter="Object.keys(proposalsWithFilter).length"
                class="ml-1"
              />
            </h2>
          </div>
        </div>
        <router-link
          v-if="canCreateProposal"
          :to="{ name: 'create', params: { key } }"
        >
          <UiButton>New proposal</UiButton>
        </router-link>
        <router-link
          v-if="isMember && isEns"
          :to="{ name: 'settings', params: { key } }"
          class="ml-2"
        >
          <UiButton>
            <Icon size="24" name="gear" class="mr-n4 ml-n4 mt-n1 d-block" />
          </UiButton>
        </router-link>
      </div>
    </Container>
    <Container :slim="true">
      <Block :slim="true">
        <div
          class="px-4 py-3 bg-gray-dark overflow-auto menu-tabs rounded-top-0 rounded-md-top-2"
        >
          <router-link
            v-for="state in states"
            :key="state"
            v-text="state"
            :to="`/${key}/${state}`"
            :class="tab === state && 'text-white'"
            class="mr-3 text-gray tab"
          />
        </div>
        <RowLoading v-if="loading" class="border-top" />
        <div v-if="loaded">
          <RowProposal
            v-for="(proposal, i) in proposalsWithFilter"
            :key="i"
            :proposal="proposal"
            :space="space"
            :verified="space.verified"
            :i="i"
            class="border-top"
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
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { filterProposals, isAddressEqual } from '@/helpers/utils';

export default {
  data() {
    return {
      loading: false,
      loaded: false,
      proposals: {},
      tab: 'all'
    };
  },
  computed: {
    ...mapState(['app', 'web3']),
    canCreateProposal() {
      if (this.isDao || this.isHarmony) {
        return (this.isValidator || this.isMember);
      } else {
        // check members
        if (this.space.members.length > 0) {
          return this.isMember;
        } else {
          return this.$auth.isAuthenticated.value;
        }
      }
    },
    isValidator() {
      if (!this.web3.account) {
        return false;
      }

      const validator = this.app.validators.find(v =>
        isAddressEqual(v.address, this.web3.account)
      );

      return Boolean(validator && validator.active);
    },
    key() {
      return this.domain || this.$route.params.key;
    },
    space() {
      return this.app.spaces[this.key];
    },
    states() {
      const states = [
        'all',
        // 'core',
        // 'community',
        'active',
        'pending',
        'closed'
      ];
      return this.space.filters.onlyMembers
        ? states.filter(state => !['core', 'community'].includes(state))
        : states;
    },
    totalProposals() {
      return Object.keys(this.proposals).length;
    },
    proposalsWithFilter() {
      if (this.totalProposals === 0) return {};
      return Object.fromEntries(
        Object.entries(this.proposals)
          .filter(proposal => filterProposals(this.space, proposal, this.tab))
          .sort((a, b) => b[1].msg.payload.end - a[1].msg.payload.end, 0)
      );
    },
    isMember() {
      if (!this.web3.account) {
        return false;
      }

      if (this.space.members.length > 0) {
        const member = this.space.members.find(v =>
          isAddressEqual(v, this.web3.account)
        );
        return (member !== undefined);
      } else {
        return false;
      }
    },
    isEns() {
      return this.key.includes('.eth') || this.key.includes('.xyz');
    },
    isDao() {
      return ['dao-mainnet', 'dao-testnet'].indexOf(this.key) > -1;
    },
    isHarmony() {
      return ['staking-mainnet', 'staking-testnet'].indexOf(this.key) > -1;
    }
  },
  methods: {
    ...mapActions(['getProposals'])
  },
  async created() {
    this.loading = true;
    this.tab =
      this.$route.params.tab || this.space.filters.defaultTab || this.tab;
    this.proposals = await this.getProposals(this.space);
    this.loading = false;
    this.loaded = true;
  }
};
</script>
