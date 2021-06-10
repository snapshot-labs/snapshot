<template>
  <Block
    v-if="plugins.length > 0 && ts >= proposal.end"
    :title="'Actions'"
    :loading="!loaded"
  >
    <div v-if="loaded">
      <UiButton
        v-for="plugin in plugins"
        :key="plugin"
        @click="execute(plugin)"
        :loading="loading"
        :disabled="!$auth.isAuthenticated.value"
        class="width-full button--submit"
      >
        {{ $t('submitOnchain') }}
      </UiButton>
    </div>
  </Block>
</template>

<script>
import { mapActions } from 'vuex';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';

export default {
  props: ['id', 'space', 'proposal', 'results', 'loaded'],
  data() {
    return {
      loading: false
    };
  },
  computed: {
    ts() {
      return (Date.now() / 1e3).toFixed();
    },
    winningChoice() {
      let winningChoice = 0;
      let winningScore = 0;
      this.results.totalScores.forEach((score, i) => {
        if (score[0] > winningScore) {
          winningChoice = i + 1;
          winningScore = score[0];
        }
      });
      return winningChoice;
    },
    plugins() {
      if (this.space?.plugins?.['aragon']) return ['aragon'];
      return [];
    }
  },
  methods: {
    ...mapActions(['notify']),
    async execute(plugin) {
      this.loading = true;
      const action = new plugins[plugin]();
      try {
        const tx = await action.action(
          this.web3.network.key,
          this.$auth.web3,
          this.space.plugins[plugin],
          this.proposal.plugins[plugin],
          this.id,
          this.winningChoice
        );
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        this.notify(['green', this.$t('notify.youDidIt')]);
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    }
  }
};
</script>
