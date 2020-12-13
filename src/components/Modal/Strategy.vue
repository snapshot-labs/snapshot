<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3>{{ strategy.name ? 'Edit' : 'Add' }} strategy</h3>
    </template>
    <div class="mt-4 mx-0 mx-md-4">
      <div v-if="input.name" class="p-4 mb-4 border rounded-2 text-white">
        <h4 v-text="input.name" class="mb-3 text-center" />
        <UiButton
          class="d-block width-full mb-3 overflow-x-auto"
          style="height: auto;"
        >
          <textarea-autosize
            v-model="input.params"
            placeholder="Strategy parameters"
            class="input text-left"
            style="width: 560px;"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          class="button--submit width-full"
        >
          {{ strategy.name ? 'Save' : 'Add' }}
        </UiButton>
      </div>
      <a
        v-else
        v-for="strategy in strategies"
        :key="strategy.key"
        @click="select(strategy.key)"
      >
        <BlockStrategy :strategy="strategy" />
      </a>
    </div>
  </UiModal>
</template>

<script>
import { clone, filterStrategies } from '@/helpers/utils';
import strategies from '@/helpers/strategies';

const defaultParams = {
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
};

export default {
  props: ['open', 'strategy'],
  data() {
    return {
      input: {
        name: '',
        params: JSON.stringify(defaultParams, null, 2)
      }
    };
  },
  watch: {
    open() {
      if (this.strategy?.name) {
        const strategy = this.strategy;
        strategy.params = JSON.stringify(strategy.params, null, 2);
        this.input = this.strategy;
      } else {
        this.input = {
          name: '',
          params: JSON.stringify(defaultParams, null, 2)
        };
      }
    }
  },
  computed: {
    strategies() {
      return filterStrategies(strategies, this.app.spaces);
    },
    isValid() {
      try {
        const params = JSON.parse(this.input.params);
        return !!params.symbol;
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    select(strategy) {
      this.input.name = strategy;
    },
    handleSubmit() {
      const strategy = clone(this.input);
      strategy.params = JSON.parse(strategy.params);
      this.$emit('add', strategy);
      this.$emit('close');
    }
  }
};
</script>
