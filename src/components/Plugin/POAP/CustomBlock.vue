<template>
  <Block title="I voted POAP" :loading="loading">
    <div class="d-flex flex-column flex-items-center">
      <img :src="headerImg" alt="" class="mb-2" />
      <div class="text-white text-center mb-2">{{ title }}</div>
      <img :src="mainImg" alt="" class="mb-2" />
      <UiButton
        class="width-full mb-2"
        @click="action"
        v-if="buttonText"
        :disabled="!actionEnabled"
      >
        {{ buttonText }}
      </UiButton>
    </div>
  </Block>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/poap';

export default {
  props: ['space', 'proposal', 'results', 'loaded', 'strategies'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      states: {},
      currentState: 'NOTPOAP',
      account: null,
      poapImg: ''
    };
  },
  computed: {
    title() {
      return this.states[this.currentState].header;
    },
    buttonText() {
      return this.states[this.currentState].buttonText;
    },
    mainImg() {
      return this.poapImg
        ? this.poapImg
        : this.states[this.currentState].mainImage;
    },
    headerImg() {
      return this.states[this.currentState].headerImage;
    },
    actionEnabled() {
      if (!this.$auth.isAuthenticated.value) return false;
      if (this.currentState === 'NOTVOTED') return false;
      return true;
    }
  },
  async created() {
    this.loading = true;

    if (this.$auth.isAuthenticated.value) {
      const accounts = await this.$auth.web3.listAccounts();
      this.account = accounts[0];
    }

    this.states = await this.plugin.getCurrentStates();
    const response = await this.plugin.getCurrentState(
      this.proposal.id,
      this.account
    );

    const { currentState, poapImg } = response.data;

    if (poapImg) {
      this.poapImg = poapImg;
    }

    this.currentState = currentState;

    this.loading = false;
  },
  methods: {
    async action() {
      const accounts = await this.$auth.web3.listAccounts();
      this.account = accounts[0];
      switch (this.currentState) {
        case 'CLAIMED':
          window.open('https://app.poap.xyz/scan/' + this.account, '_blank');
          break;
        default:
          this.currentState = await this.plugin.claim(
            this.proposal.id,
            this.account
          );
          console.log(this.currentState);
          break;
      }
    }
  }
};
</script>
