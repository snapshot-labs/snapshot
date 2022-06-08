<script setup>
import { useIntl } from '@/composables/useIntl';
import { useNetworksFilter } from '@/composables/useNetworksFilter';
import { getIpfsUrl } from '@/helpers/utils';

const { formatCompactNumber } = useIntl();

const { networksSpacesCount } = useNetworksFilter();

defineProps(['network']);
</script>

<template>
  <BaseBlock class="cursor-pointer hover:border-skin-text">
    <div class="mb-3 flex items-start">
      <BaseAvatar class="mr-2" :src="getIpfsUrl(network.logo)" size="28" />
      <div class="overflow-hidden">
        <h3 class="my-0 truncate leading-5" v-text="network.name" />
        <div
          class="text-xs leading-4 text-skin-text"
          v-text="'Chain #' + network.key"
        />
      </div>
    </div>
    <div class="text-skin-text">
      {{
        $tc('inSpaces', [
          formatCompactNumber(networksSpacesCount[network.key] ?? 0)
        ])
      }}
    </div>
  </BaseBlock>
</template>
