<script setup>
import { useIntl } from '@/composables/useIntl';
import { usePlugins } from '@/composables/usePlugins';
import { getIpfsUrl } from '@/helpers/utils';

const { formatCompactNumber } = useIntl();
const { pluginsSpacesCount } = usePlugins();

defineProps({
  plugin: Object // src/plugins/**/plugin.json
});
</script>

<template>
  <BaseBlock class="hover:border-skin-text cursor-pointer">
    <div class="flex items-center mb-2">
      <BaseAvatar class="mr-2" :src="getIpfsUrl(plugin.icon)" size="28" />
      <h3 v-text="plugin.name" class="truncate m-0" />
      <div class="ml-1">v{{ plugin.version }}</div>
    </div>
    <div class="flex justify-between items-end text-skin-text">
      <div class="flex flex-col">
        <BaseLink
          class="text-skin-text"
          :link="`https://github.com/${plugin.author}`"
          hide-external-icon
        >
          <BaseIcon name="github" class="mr-1" />
          {{ plugin.author }}
        </BaseLink>
        {{
          $tc('inSpaces', [
            formatCompactNumber(pluginsSpacesCount?.[plugin.key] ?? 0)
          ])
        }}
      </div>

      <BaseLink
        class="flex items-center"
        @click.stop
        :link="`https://github.com/snapshot-labs/snapshot/tree/develop/src/plugins/${plugin.key}`"
      >
        {{ $t('learnMore') }}
      </BaseLink>
    </div>
  </BaseBlock>
</template>
