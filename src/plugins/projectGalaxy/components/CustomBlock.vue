<script>
import Plugin from '../index';
import { useWeb3 } from '@/composables/useWeb3';

const { web3Account } = useWeb3();

const APP_URL = 'https://galaxy.eco';
const NO_OAT_IMAGE =
  'https://snapshotsplugin.s3.us-west-2.amazonaws.com/placeholder.png';
const IMG_LOGO_GALAXY =
  'https://d257b89266utxb.cloudfront.net/galaxy/images/avatar/0x4960c283c45e1898c41633c39fb2015167b20dc3-1655711973.png';
const IMG_ICON_LINK =
  'https://d257b89266utxb.cloudfront.net/galaxy/images/avatar/0x4960c283c45e1898c41633c39fb2015167b20dc3-1655712057.png';
const IMG_ICONS = {
  CLAIMED:
    'https://d257b89266utxb.cloudfront.net/galaxy/images/avatar/0x4960c283c45e1898c41633c39fb2015167b20dc3-1655712157.png',
  CLAIMING:
    'https://d257b89266utxb.cloudfront.net/galaxy/images/avatar/0x4960c283c45e1898c41633c39fb2015167b20dc3-1655712194.png'
};

const STATES = {
  NO_OAT: {
    buttonText: 'No OAT'
  },
  WAIT_TO_START: {
    buttonText: 'Wait to Start'
  },
  VOTE_TO_CLAIM: {
    buttonText: 'Vote to Claim'
  },
  CLAIM: {
    buttonText: 'Claim'
  },
  CLAIMING: {
    buttonText: 'Claiming'
  },
  CLAIMED: {
    buttonText: 'Claimed'
  },
  ENDED: {
    buttonText: 'Campaign Ended'
  }
};

// STATES
const NO_OAT = 'NO_OAT';
const WAIT_TO_START = 'WAIT_TO_START';
const CLAIM = 'CLAIM';
const CLAIMING = 'CLAIMING';
const CLAIMED = 'CLAIMED';

export default {
  props: ['space', 'proposal', 'results', 'loaded', 'strategies', 'votes'],
  data() {
    return {
      disabled: false,
      oats: {},
      loading: false,
      plugin: new Plugin(this.space.plugins.projectGalaxy.api),
      currentState: NO_OAT,
      currentCampaignUrl: '',
      currentCampaignId: '',
      address: '',
      oatImg: '',
      imgLogoGalaxy: IMG_LOGO_GALAXY,
      imgIconLink: IMG_ICON_LINK,
      imgIcons: IMG_ICONS
    };
  },
  computed: {
    web3Account() {
      return web3Account.value;
    },
    buttonText() {
      return STATES[this.currentState]
        ? STATES[this.currentState].buttonText
        : STATES[NO_OAT].buttonText;
    },
    mainImg() {
      return this.oatImg ? this.oatImg : NO_OAT_IMAGE;
    },
    urlOAT() {
      return `${APP_URL}/${this.currentCampaignUrl}`;
    },
    galaxyId() {
      return `${APP_URL}/galaxyid/${this.address}`;
    },
    actionEnabled() {
      return (
        this.currentState === CLAIM ||
        this.currentState === CLAIMING ||
        this.currentState === CLAIMED
      );
    }
  },
  watch: {
    currentState: async function (newCurrentState) {
      if (newCurrentState === CLAIMING) {
        // If the state is loading: start updating the state
        this.checkStateLoop(this.updateState);
      }
    },
    web3Account: async function (newAccount) {
      // Update the state if the address
      this.loading = true;
      this.address = newAccount;
      await this.updateState();
      this.loading = false;
    },
    votes: async function () {
      // Update the state if the votes change
      this.loading = true;
      await this.updateState();
      this.loading = false;
    }
  },
  async created() {
    this.address = web3Account.value;
    this.loading = true;
    // get campain info from config
    this.getCampainInfo();
    // not empty oat
    if (this.currentState !== NO_OAT) {
      await this.getOAT(this.currentCampaignId);
      await this.updateState();
    }
  },
  methods: {
    getCampainInfo() {
      if (this.space.plugins.projectGalaxy?.oats) {
        this.oats = this.space.plugins.projectGalaxy.oats;
        this.currentCampaignUrl = this.oats[this.proposal.id];
        if (this.currentCampaignUrl) {
          this.currentCampaignId =
            this.currentCampaignUrl.match(/[^/]+(?=\/$|$)/g)[0];
          this.currentState = WAIT_TO_START;
        } else {
          this.currentState = NO_OAT;
        }
      }
    },
    async action() {
      if (this.currentState === CLAIM) {
        await this.claimOAT();
      }
    },
    // Check the state if the current state is loading
    async checkStateLoop() {
      await this.updateState();
      if (this.currentState === CLAIMING) {
        setTimeout(() => this.checkStateLoop(), 5000);
      }
    },
    // update state
    async updateState() {
      try {
        const response = await this.plugin.getCurrentState(
          this.proposal.id,
          this.address,
          this.currentCampaignId
        );

        const { currentState } = response;

        this.currentState = currentState;
        this.loading = false;
      } catch (e) {
        this.disabled = true;
      }
    },
    // get oat image
    async getOAT(campainId) {
      try {
        this.oatImg = await this.plugin.getOATImage(campainId);
      } catch (e) {
        this.disabled = true;
      }
    },
    // claim OAT
    async claimOAT() {
      try {
        const success = await this.plugin.claim(
          this.address,
          this.currentCampaignId
        );
        if (success) {
          this.currentState = CLAIMING;
        } else {
          await this.updateState();
        }
      } catch (e) {
        await this.updateState();
      }
    }
  }
};
</script>

<template>
  <BaseBlock
    v-if="!disabled && currentState !== 'NO_OAT'"
    title="OAT for Vote"
    :loading="loading"
    :slim="true"
    class="overflow-hidden"
  >
    <div class="relative overflow-hidden">
      <!-- background image -->
      <div class="absolute bottom-0 top-0 right-0 left-0 z-0 w-full blur-3xl">
        <img
          :src="mainImg"
          alt=""
          class="absolute bottom-0 top-0 right-0 left-0 z-0 w-full"
        />
        <div
          class="absolute bottom-0 top-0 right-0 left-0 z-0 w-full"
          :style="{
            background:
              'linear-gradient(180deg, #211f24 0%, rgba(33, 31, 36, 0) 51.04%, #211f24 100%)'
          }"
        ></div>
      </div>
      <!-- main content -->
      <div
        class="relative bottom-0 top-0 right-0 left-0 z-10 flex flex-col items-center py-6 px-6"
      >
        <img :src="imgLogoGalaxy" alt="" class="mb-3 h-auto w-full" style="" />
        <img
          :src="mainImg"
          alt=""
          class=""
          style="
            vertical-align: middle;
            width: 180px;
            height: 180px;
            border-radius: 50%;
          "
        />
        <base-button-icon
          class="flex w-full cursor-pointer items-center justify-center"
          :disabled="!actionEnabled"
          style="
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 100px;
            margin-top: 32px;
            padding: 8px 0;
          "
          @click="action"
        >
          <img
            v-if="currentState === 'CLAIMING' || currentState === 'CLAIMED'"
            :src="imgIcons[currentState]"
            alt=""
            class="mr-2"
            style="width: 20px; height: auto"
          />
          <span
            :class="[
              'text-base font-semibold',
              {
                'text-white': actionEnabled,
                'text-green': currentState === 'CLAIMED'
              }
            ]"
            >{{ buttonText }}</span
          >
        </base-button-icon>
        <a
          :href="galaxyId"
          target="_blank"
          class="mt-4 flex flex-nowrap items-center"
        >
          <span
            style="
              font-style: normal;
              font-weight: 400;
              font-size: 16px;
              line-height: 20px;
            "
            >View My OAT Collection</span
          >
          <img
            :src="imgIconLink"
            alt=""
            class="ml-1"
            style="width: 14px; height: 14px"
          />
        </a>
      </div>
    </div>
  </BaseBlock>
</template>
