<script setup>
import { useIntl } from '@/composables/useIntl';
import { useNetworksFilter } from '@/composables/useNetworksFilter';
import { getIpfsUrl } from '@/helpers/utils';

const { formatCompactNumber } = useIntl();

const { networksSpacesCount } = useNetworksFilter();

defineProps(['network']);
</script>

<template>
  <Block class="hover-border">
    <div class="flex items-start mb-3">
      <UiAvatar
        class="mr-2"
        :imgsrc="getIpfsUrl(network.imageIPFS)"
        :seed="network.key"
        size="28"
      />
      <div class="overflow-hidden">
        <h3 class="truncated my-0 leading-5" v-text="network.name" />
        <div
          v-text="'Chain #' + network.key"
          class="text-color text-xs leading-4"
        />
      </div>
    </div>
    <div class="text-color">
      {{
        $tc('inSpaces', [
          formatCompactNumber(networksSpacesCount[network.key] ?? 0)
        ])
      }}
    </div>
  </Block>
</template>
