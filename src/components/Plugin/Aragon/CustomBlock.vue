<script>
import plugins from '@/../snapshot-plugins/src/plugins';
import { useNotifications } from '@/composables/useNotifications';

const { notify } = useNotifications();

export default {
  props: ['id', 'space', 'proposal', 'results', 'loaded'],
  inject: ['web3', 'notify'],
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
      this.results.resultsByStrategyScore.forEach((score, i) => {
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
    async execute(plugin) {
      this.loading = true;
      const action = new plugins[plugin]();
      try {
        const tx = await action.action(
          this.web3.value.network.key,
          this.$auth.web3,
          this.space.plugins[plugin],
          this.proposal.plugins[plugin],
          this.id,
          this.winningChoice
        );
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        notify(['green', this.$t('notify.youDidIt')]);
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    }
  }
};
</script>

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
        class="w-full button--submit"
      >
        {{ $t('submitOnchain') }}
      </UiButton>
    </div>
  </Block>
</template>
