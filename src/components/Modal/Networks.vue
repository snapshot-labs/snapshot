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
    <div class="mt-4 mx-0 mx-md-4">
      <a
        v-for="network in networks"
        :key="network.key"
        @click="select(network.key)"
      >
        <BlockNetwork :network="network" />
      </a>
      <NoResults v-if="Object.keys(networks).length < 1" />
    </div>
  </UiModal>
</template>

<script>
import { useNetworkFilter } from '@/composables/useSearchFilters';

import { computed, ref, toRefs } from 'vue';
export default {
  setup(props, { emit }) {
    const { open } = toRefs(props);
    const searchInput = ref('');

    const { filteredNetworks } = useNetworkFilter();
    const networks = computed(() => filteredNetworks(searchInput.value));

    function select(key) {
      emit('update:modelValue', key);
      emit('close');
    }

    return { networks, searchInput, select, open };
  }
};
</script>
