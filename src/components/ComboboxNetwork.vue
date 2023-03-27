<script setup lang="ts">
import { useNetworksFilter } from '@/composables/useNetworksFilter';

defineProps<{
  network: string;
  information?: string;
  isDisabled?: boolean;
}>();

const emit = defineEmits(['select']);

const query = ref('');

const { filterNetworks } = useNetworksFilter();

const networks = computed((): { id: string; name: string }[] => {
  const filteredNetworks = filterNetworks(query.value).map(_n => ({
    id: _n.key,
    name: _n.name
  }));

  return filteredNetworks;
});
</script>

<template>
  <BaseCombobox
    :label="$t('settings.network.label')"
    :items="networks"
    :selected-id="network"
    :information="information"
    :is-disabled="isDisabled"
    @select="value => emit('select', value.id)"
    @search="value => (query = value)"
  >
    <template #item="{ item }">
      <div class="truncate pr-2">
        {{ item.name }}
      </div>

      <BasePill class="leading-4"> #{{ item.id }} </BasePill>
    </template>
  </BaseCombobox>
</template>
