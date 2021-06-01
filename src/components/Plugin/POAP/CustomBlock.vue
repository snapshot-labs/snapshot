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
//import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
// TODO: cambiar por poap el plugin
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/quorum';

export default {
  props: ['space', 'proposal', 'results', 'loaded', 'strategies'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      states: {},
      currentState: 'NOTPOAP',
      account: null
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
      return this.states[this.currentState].mainImage;
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
    /*
    if (this.$auth.isAuthenticated.value) {
      const accounts = await this.$auth.web3.listAccounts();
      this.account = accounts[0];
    }

    this.states = await this.plugin.getCurrentStates();
    const response = await this.plugin.getCurrentState(this.proposal.id, this.account);
    const { currentState, poapUrl } = response.data;
    if (poapUrl) {
      this.state = {
        ...this.state,
        CLAIMED: {mainImage: poapUrl},
        NOTVOTED: {mainImage: poapUrl},
        UNCLAIMED: {mainImage: poapUrl},
      }
    }
    this.currentState = currentState;
    */
    this.states = {
      NOTPOAP: {
        header: "A POAP hasn't been setup for this proposal yet :'(",
        headerImage:
          'https://img-test-rlajous.s3.amazonaws.com/Property 1=nopoap.png',
        mainImage: 'https://img-test-rlajous.s3.amazonaws.com/Group+1229.png'
      },
      NOTVOTED: {
        headerImage:
          'https://img-test-rlajous.s3.amazonaws.com/Property 1=unavaliable.png',
        mainImage: 'https://img-test-rlajous.s3.amazonaws.com/Group+1229.png',
        header: 'Vote to get this POAP',
        buttonText: 'Claim'
      },
      UNCLAIMED: {
        headerImage:
          'https://img-test-rlajous.s3.amazonaws.com/Property 1=Voted.png',
        mainImage: 'https://img-test-rlajous.s3.amazonaws.com/Group+1229.png',
        header: 'Thanks for voting Claim your I VOTED POAP',
        buttonText: 'Claim'
      },
      CLAIMED: {
        headerImage:
          'https://img-test-rlajous.s3.amazonaws.com/Property 1=Claimed.png',
        mainImage: 'https://img-test-rlajous.s3.amazonaws.com/Group+1229.png',
        header: 'Congratulations! You got a new POAP in your account',
        buttonText: 'Show me my badges'
      }
    };
    this.currentState = 'CLAIMED';

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
          /*
          const response = await this.plugin.claim(this.proposal.id, this.account);
          if (response.ok) {
            this.currentState = 'CLAIMED';
          } else {
            // Error
          }
          */
          break;
      }
    }
  }
};
</script>
