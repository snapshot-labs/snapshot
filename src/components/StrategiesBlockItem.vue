<script setup lang="ts">
import { SpaceStrategy } from '@/helpers/interfaces';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

defineProps<{
  strategiesForm: SpaceStrategy[];
}>();

const emit = defineEmits(['removeStrategy', 'editStrategy']);
</script>

<template>
  <div v-for="(strategy, i) in strategiesForm" :key="i" class="h-full flex">
    <button
      @click="emit('editStrategy', i)"
      class="p-4 border rounded-md w-full flex justify-between items-center hover:border-skin-text"
    >
      <div class="text-left truncate">
        <h4 class="truncate">{{ strategy.name }}</h4>
        <div class="truncate">
          <span>{{ networks[Number(strategy.network)].name }} </span>
        </div>
        <div>
          <span>
            {{ strategy.params?.symbol }}
          </span>
        </div>
      </div>
      <BaseButtonIcon @click.stop="emit('removeStrategy', i)" class="-mr-2">
        <BaseIcon name="close" size="14" />
      </BaseButtonIcon>
    </button>
  </div>
</template>
