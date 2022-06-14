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
    class="flex h-full truncate"
    @click="emit('editStrategy', i)"
  >
    <button
      class="flex w-full items-center justify-between rounded-md border p-4"
    >
      <div class="flex items-center gap-2 truncate pr-[20px] text-left">
        <h4 class="truncate">{{ strategy.name }}</h4>
        <BasePill> ${{ strategy.params.symbol }} </BasePill>
      </div>
      <BaseButtonIcon class="-mr-2" @click.stop="emit('removeStrategy', i)">
        <BaseIcon name="close" size="14" />
      </BaseButtonIcon>
    </button>
  </div>
</template>
