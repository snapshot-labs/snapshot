<script setup>
import { useIntl } from '@/composables/useIntl';
import { useNetworks } from '@/composables/useNetworks';

const { formatCompactNumber } = useIntl();

const { networksSpacesCount } = useNetworks();

defineProps(['network']);

function getLogoUrl(key) {
  return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/networks/${key}.png`;
}
</script>

<template>
  <Block class="hover-border">
    <div class="flex items-start mb-3">
      <UiAvatar
        class="mr-2"
        :imgsrc="getLogoUrl(network.key)"
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
