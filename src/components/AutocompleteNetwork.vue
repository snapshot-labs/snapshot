<script setup lang="ts">
import { ref, computed } from 'vue';
import { getIpfsUrl } from '@/helpers/utils';
import { useNetworksFilter } from '@/composables/useNetworksFilter';

const props = defineProps<{
  network?: string;
  input: string;
}>();

const { filterNetworks } = useNetworksFilter();

const searchNetwork = ref('');
const networks = computed(() => {
  const filteredNetworks = filterNetworks(searchNetwork.value).map(_n => ({
    label: _n.name,
    value: _n.key,
    option: _n
  }));

  //  Move spaceNetwork to the beginning of the list
  if (props.network) {
    const spaceNetwork = filteredNetworks.find(n => n.value === props.network);
    if (spaceNetwork) {
      const spaceNetworkIndex = filteredNetworks.indexOf(spaceNetwork);
      filteredNetworks.splice(spaceNetworkIndex, 1);
      filteredNetworks.unshift(spaceNetwork);
    }
  }

  return filteredNetworks;
});
</script>

<template>
  <BaseAutocomplete
    :options="networks"
    @update:value="input => $emit('update:input', input)"
    :value="input"
    v-model:search="searchNetwork"
    label="Network"
    :placeholder="$t('selectNetwork')"
    class="mb-3"
  >
    <template v-slot:option="{ option }">
      <div class="group flex items-center justify-between">
        <div class="flex items-center truncate">
          <img
            class="mr-2 w-4 h-4 rounded-full"
            :src="getIpfsUrl(option?.logo)"
          />
          <span v-text="option?.name" class="truncate mr-2" />
        </div>
        <span
          class="h-[20px] rounded-full leading-normal text-xs text-white bg-skin-text text-center px-2"
        >
          #{{ option?.chainId }}
        </span>
      </div>
    </template>
  </BaseAutocomplete>
</template>
