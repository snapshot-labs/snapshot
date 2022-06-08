<script>
import Plugin from '../index';
import { useFlashNotification } from '@/composables/useFlashNotification';

const { notify } = useFlashNotification();

const STATES = {
  NO_POAP: {
    header: 'poap.no_poap_header',
    headerImage: 'https://snapshotsplugin.s3.us-west-2.amazonaws.com/empty.svg',
    mainImage:
      'https://snapshotsplugin.s3.us-west-2.amazonaws.com/placeholder.png'
  },
  NOT_VOTED: {
    headerImage: 'https://snapshotsplugin.s3.us-west-2.amazonaws.com/vote.svg',
    header: 'poap.no_voted_header',
    buttonText: 'poap.button_claim'
  },
  UNCLAIMED: {
    headerImage: 'https://snapshotsplugin.s3.us-west-2.amazonaws.com/claim.svg',
    header: 'poap.unclaimed_header',
    buttonText: 'poap.button_claim'
  },
  CLAIMED: {
    headerImage:
      'https://snapshotsplugin.s3.us-west-2.amazonaws.com/succes.svg',
    header: 'poap.claimed_header',
    buttonText: 'poap.button_show'
  },
  LOADING: {
    headerImage:
      'https://snapshotsplugin.s3.us-west-2.amazonaws.com/succes.svg',
    header: 'poap.loading_header',
    buttonText: ''
  }
};

// STATES
const NO_POAP = 'NO_POAP';
const NOT_VOTED = 'NOT_VOTED';
const LOADING = 'LOADING';
const UNCLAIMED = 'UNCLAIMED';
const CLAIMED = 'CLAIMED';

export default {
  inject: ['web3', 'notify'],
  props: ['space', 'proposal', 'results', 'loaded', 'strategies', 'votes'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      currentState: NO_POAP,
      address: '',
      poapImg: '',
      loadButton: false
    };
  },
  computed: {
    web3Account() {
      return this.web3.value.account;
    },
    header() {
      return STATES[this.currentState].header;
    },
    buttonText() {
      return STATES[this.currentState].buttonText;
    },
    mainImg() {
      return this.poapImg ? this.poapImg : STATES[this.currentState].mainImage;
    },
    headerImg() {
      return STATES[this.currentState].headerImage;
    },
    actionEnabled() {
      return this.currentState !== NOT_VOTED && this.currentState !== NO_POAP;
    },
    actionLoading() {
      return this.currentState === LOADING || this.loadButton;
    }
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentState: async function (newCurrentState, oldCurrentState) {
      if (newCurrentState === LOADING) {
        // If the state is loading: start updating the state
        this.checkStateLoop(this.updateState);
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
  async created() {
    this.address = this.web3Account;
    this.loading = true;
    await this.updateState();
  },
  methods: {
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
          break;
      }
    },
    // Check the state if the current state is loading
    async checkStateLoop() {
      await this.updateState();
      switch (this.currentState) {
        case LOADING:
          setTimeout(() => this.checkStateLoop(), 5000);
          break;
        case UNCLAIMED:
          notify(['red', this.$t('poap.error_claim')]);
          break;
        case CLAIMED:
          notify(['green', this.$t('poap.success_claim')]);
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
    }
  }
};
</script>

<template>
  <BaseBlock title="I voted POAP" :loading="loading">
    <div class="flex flex-col items-center">
      <img :src="headerImg" alt="" class="mb-2" />
      <div class="mb-2 text-center text-skin-link">{{ $t(header) }}</div>
      <img
        :src="mainImg"
        alt=""
        class="mt-1"
        style="
          vertical-align: middle;
          width: auto;
          height: auto;
          max-width: 125px;
        "
      />
      <BaseButton
        v-if="currentState !== 'NO_POAP'"
        class="mb-2 mt-3 w-full"
        :disabled="!actionEnabled"
        :loading="actionLoading"
        @click="action"
      >
        {{ $t(buttonText) }}
      </BaseButton>
    </div>
  </BaseBlock>
</template>
