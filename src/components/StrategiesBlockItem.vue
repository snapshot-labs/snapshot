<script setup lang="ts">
import { SpaceStrategy } from '@/helpers/interfaces';

defineProps<{
  strategiesForm: SpaceStrategy[];
}>();

const emit = defineEmits(['removeStrategy', 'editStrategy']);
</script>

<template>
  <div
    v-for="(strategy, i) in strategiesForm"
    :key="i"
    class="h-full flex truncate"
  >
    <button
      class="p-4 border rounded-md w-full flex justify-between items-center"
    >
      <div class="text-left truncate flex items-center gap-2 pr-[20px]">
        <h4 class="truncate">{{ strategy.name }}</h4>
        <BasePill> ${{ strategy.params.symbol }} </BasePill>
      </div>
      <BaseButtonIcon @click.stop="emit('removeStrategy', i)" class="-mr-2">
        <BaseIcon name="close" size="14" />
      </BaseButtonIcon>
    </button>
  </div>
</template>
