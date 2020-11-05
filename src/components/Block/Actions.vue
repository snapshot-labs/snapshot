<template>
  <Block v-if="plugins.length > 0 && ts >= payload.end" :title="'Actions'">
    <UiButton
      v-for="plugin in plugins"
      :key="plugin"
      @click="execute(plugin)"
      :loading="loading"
      :disabled="!$auth.isAuthenticated"
      class="width-full button--submit"
    >
      Submit on-chain
    </UiButton>
  </Block>
</template>

<script>
import { mapActions } from 'vuex';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';

export default {
  props: ['id', 'space', 'payload', 'results'],
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
      if (this.space && this.space.plugins)
        return Object.keys(this.space.plugins).filter(
          plugin =>
            this.payload &&
            this.payload.metadata &&
            this.payload.metadata.plugins &&
            this.payload.metadata.plugins[plugin]
        );
      return [];
    }
  },
  methods: {
    ...mapActions(['notify']),
    async execute(plugin) {
      this.loading = true;
      const action = new plugins[plugin]();
      try {
        const result = await action.action(
          this.$auth.web3,
          this.space.plugins[plugin],
          this.payload.metadata.plugins[plugin],
          this.id,
          this.winningChoice
        );
        console.log('Result', result);
        this.notify(['green', `The settlement is on-chain, congrats!`]);
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    }
  }
};
</script>
