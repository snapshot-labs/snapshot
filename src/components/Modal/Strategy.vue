<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{ strategy.name ? $t('editStrategy') : $t('settings.addStrategy') }}
      </h3>
    </template>
    <Search
      v-if="!strategy.name && !input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 mx-md-4">
      <div v-if="input.name" class="p-4 mb-4 border rounded-2 text-white">
        <h4 v-text="input.name" class="mb-3 text-center" />
        <UiButton
          class="d-block width-full mb-3 overflow-x-auto"
          style="height: auto"
        >
          <TextareaAutosize
            v-model="input.params"
            :placeholder="$t('strategyParameters')"
            class="input text-left"
            style="width: 560px"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          class="button--submit width-full"
        >
          {{ strategy.name ? $t('save') : $t('add') }}
        </UiButton>
      </div>
      <div v-if="!input.name">
        <a
          v-for="strategy in strategies"
          :key="strategy.key"
          @click="select(strategy.key)"
        >
          <BlockStrategy :strategy="strategy" />
        </a>
        <NoResults v-if="Object.keys(strategies).length < 1" />
      </div>
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
  emits: ['add', 'close'],
  data() {
    return {
      input: {
        name: '',
        params: JSON.stringify(defaultParams, null, 2)
      },
      searchInput: ''
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
      return filterStrategies(strategies, this.app.spaces, this.searchInput);
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
