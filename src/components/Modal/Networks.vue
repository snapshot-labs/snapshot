<script setup>
import { ref, computed, watch } from 'vue';
import { useNetworksFilter } from '@/composables/useNetworksFilter';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const searchInput = ref('');
const { filterNetworks, getNetworksSpacesCount, loadingNetworks } =
  useNetworksFilter();
const networks = computed(() => filterNetworks(searchInput.value));

watch(
  () => props.open,
  () => {
    if (props.open) getNetworksSpacesCount();
  }
);

function select(key) {
  emit('update:modelValue', key);
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('networks') }}</h3>
    </template>
    <Search
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />

    <div class="mt-4 mx-0 md:mx-4 min-h-[339px]">
      <RowLoadingBlock v-if="loadingNetworks" />
      <div v-else>
        <a
          v-for="network in networks"
          :key="network.key"
          @click="select(network.key)"
        >
          <BlockNetwork :network="network" />
        </a>
        <NoResults v-if="Object.keys(networks).length < 1" />
      </div>
    </div>
  </UiModal>
</template>
