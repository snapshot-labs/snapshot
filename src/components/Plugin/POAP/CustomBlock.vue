<template>
  <Block title="I voted POAP" :loading="false">
    <div class="d-flex flex-column flex-items-center">
      <img :src="headerImg" alt="" class="mb-2" />
      <div class="text-white text-center mb-2">{{ title }}</div>
      <img :src="mainImg" alt="" class="mb-2" />
      <UiButton class="width-full mb-2" v-if="claimed">
        {{ buttonText }}
      </UiButton>
    </div>
  </Block>
</template>

<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/quorum';

export default {
  props: ['space', 'proposal', 'results', 'loaded', 'strategies'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      poap: false,
      voted: false,
      claimed: false
    };
  },
  computed: {
    title() {
      if (this.poap) {
        if (this.voted) {
          if (!this.claimed) {
            return 'Thanks for voting Claim your I VOTED POAP';
          } else {
            return 'Congratulations! You got a new POAP in your account';
          }
        } else {
          return 'Vote to get this POAP';
        }
      } else {
        return "A POAP hasn't been setup for this proposal yet :'(";
      }
    },
    buttonText() {
      if (this.claimed) {
        return 'Show me my badges';
      } else {
        return 'Claim';
      }
    },
    mainImg() {
      return 'https://img-test-rlajous.s3.amazonaws.com/Group+1229.png';
    },
    headerImg() {
      return 'https://img-test-rlajous.s3.amazonaws.com/Property 1=unavaliable.png';
    }
  },

  async created() {
    this.loading = true;

    this.totalVotingPower = await this.plugin.getTotalVotingPower(
      getProvider(this.space.network),
      this.space.plugins.quorum,
      this.proposal.snapshot
    );

    this.quorum =
      this.totalVotingPower === 0 ? 0 : this.totalScore / this.totalVotingPower;

    this.loading = false;
  }
};
</script>
