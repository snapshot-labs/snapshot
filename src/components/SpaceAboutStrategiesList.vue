<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

defineProps<{
  strategies: any;
}>();
</script>

<template>
  <div
    v-for="(strategy, i) in strategies"
    :key="i"
    class="flex items-center justify-between border-b p-4 last:border-b-0"
  >
    <div>
      <div class="flex items-center">
        <h3>
          {{ strategy.name }}
        </h3>
        <ButtonPlayground
          :name="strategy.name"
          :network="strategy.network"
          :params="strategy.params"
        />
      </div>

      <div>{{ networks[strategy.network]?.name }}</div>
    </div>
    <div>
      <BasePill v-if="strategy.params.symbol" class="py-1">
        ${{ strategy.params.symbol }}
      </BasePill>
    </div>
  </div>
</template>
