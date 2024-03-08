<script setup lang="ts">
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';

defineProps<{
  modelValue: string;
  networks: {
    value: string;
    name: string;
    extras?: { icon?: string };
  }[];
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <TuneListbox
    :model-value="modelValue"
    label="Network"
    :items="networks"
    class="w-full"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <template #item="{ item }">
      <div class="flex items-center">
        <BaseAvatar
          v-if="item.extras?.icon"
          :src="getUrl(item.extras.icon)"
          class="mr-2"
        />
        <div class="truncate pr-2">
          {{ item.name }}
        </div>

        <BasePill class="leading-4"> #{{ item.value }} </BasePill>
      </div>
    </template>
    <template #selected="{ selectedItem }">
      <div class="flex items-center">
        <BaseAvatar :src="getUrl(selectedItem.extras?.icon)" class="mr-2" />
        <div class="truncate pr-2">
          {{ selectedItem.name }}
        </div>
      </div>
    </template>
  </TuneListbox>
</template>
