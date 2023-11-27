<script setup lang="ts">
defineProps<{
  network: string;
  hint?: string;
  disabled?: boolean;
  error?: string;
  showErrors?: boolean;
}>();

const emit = defineEmits(['select']);

const { filterNetworks } = useNetworksFilter();
const { env } = useApp();

const networks = computed((): { id: string; name: string }[] => {
  const filteredNetworks = filterNetworks().map(_n => ({
    id: _n.key,
    name: _n.name,
    extras: {
      hidden: env === 'production' ? _n.testnet : false
    }
  }));

  return filteredNetworks;
});
</script>

<template>
  <TuneCombobox
    :label="$t('settings.network.label')"
    :items="networks"
    :model-value="network"
    :hint="hint"
    :disabled="disabled"
    :error="error"
    :show-errors="showErrors"
    @update:model-value="value => emit('select', value)"
  >
    <template #item="{ item }">
      <div class="flex items-center">
        <div class="truncate pr-2">
          {{ item.name }}
        </div>

        <BasePill class="leading-4"> #{{ item.id }} </BasePill>
      </div>
    </template>
  </TuneCombobox>
</template>
