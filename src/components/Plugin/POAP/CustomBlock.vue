<template>
  <Block title="I voted POAP" :loading="loading">
    <div class="d-flex flex-column flex-items-center">
      <img :src="headerImg" alt="" class="mb-2" />
      <div class="text-white text-center mb-2">{{ title }}</div>
      <img
        :src="mainImg"
        alt=""
        class="mb-2"
        style="
          vertical-align: middle;
          width: auto;
          height: auto;
          max-width: 125px;
        "
      />
      <UiButton
        v-if="currentState !== 'NO_POAP'"
        class="width-full mb-2"
        @click="action"
        :disabled="!actionEnabled"
        :loading="actionLoading"
      >
        {{ buttonText }}
      </UiButton>
    </div>
  </Block>
</template>

<script>
import Plugin from "@snapshot-labs/snapshot.js/src/plugins/poap";
import { mapActions } from "vuex";

// STATES
const NO_POAP = 'NOTPOAP';
const NOT_VOTED = 'NOTVOTED';
const LOADING = 'LOADING';
const UNCLAIMED = 'UNCLAIMED';
const CLAIMED = 'CLAIMED';

// Check the state if the current state is loading
async function checkStateLoop(updateFunction) {
  const currentState = await updateFunction();
  if (currentState === LOADING) {
    setTimeout(() => checkStateLoop(updateFunction), 5000);
  }
}

export default {
  props: ['space', 'proposal', 'results', 'loaded', 'strategies', 'votes'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      states: {},
      currentState: NO_POAP,
      address: '',
      poapImg: '',
      loadButton: false
    };
  },
  computed: {
    web3Account() {
      return this.$store.state.web3.account;
    },
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
      return (
        this.currentState !== NOT_VOTED && this.currentState !== NO_POAP
      );
    },
    actionLoading() {
      return this.currentState === LOADING || this.loadButton;
    }
  },
  async created() {
    this.address = this.web3Account;
    this.loading = true;
    this.states = await this.plugin.getStates();
    await this.updateState();
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentState: async function (newCurrentState, oldCurrentState) {
      if (newCurrentState === LOADING) {
        // If the state is loading: start updating the state
        checkStateLoop(this.updateState);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    web3Account: async function (newAccount, preAccount) {
      // Update the state if the address
      this.loading = true;
      this.address = newAccount;
      await this.updateState();
      this.loading = false;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    votes: async function (newCurrentState, oldCurrentState) {
      // Update the state if the votes change
      this.loading = true;
      await this.updateState();
      this.loading = false;
    }
  },
  methods: {
    ...mapActions(['notify']),
    async action() {
      switch (this.currentState) {
        case CLAIMED:
          this.plugin.openScanPage(this.address);
          break;
        case UNCLAIMED:
          this.loadButton = true;
          this.currentState = await this.plugin.claim(
            this.proposal.id,
            this.address
          );
          this.loadButton = false;
          if (this.currentState === UNCLAIMED) {
            this.notify(['red', `There was a problem minting the token`]);
          } else if (this.currentState === CLAIMED) {
            this.notify(['green', `Your POAP is on your address`]);
          }
          break;
      }
    },
    async updateState() {
      const response = await this.plugin.getCurrentState(
        this.proposal.id,
        this.address
      );

      const { currentState, image_url } = response;

      if (image_url) {
        this.poapImg = image_url;
      }

      this.currentState = currentState;
      this.loading = false;
      return currentState;
    }
  }
};
</script>
