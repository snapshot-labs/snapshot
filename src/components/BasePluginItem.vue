<script setup lang="ts">
import { useIntl } from '@/composables/useIntl';
import { usePlugins } from '@/composables/usePlugins';
import { getIpfsUrl } from '@/helpers/utils';

const { formatCompactNumber } = useIntl();
const { pluginsSpacesCount } = usePlugins();

defineProps<{
  plugin: {
    icon: string;
    name: string;
    version: string;
    author: string;
    key: string;
  };
}>();
</script>

<template>
  <BaseBlock class="cursor-pointer hover:border-skin-text">
    <div class="mb-2 flex items-center">
      <BaseAvatar class="mr-2" :src="getIpfsUrl(plugin.icon)" size="28" />
      <h3 class="m-0 truncate" v-text="plugin.name" />
      <div class="ml-1">v{{ plugin.version }}</div>
    </div>
    <div class="flex items-end justify-between text-skin-text">
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
        :link="`https://github.com/snapshot-labs/snapshot/tree/develop/src/plugins/${plugin.key}`"
        @click.stop
      >
        {{ $t('learnMore') }}
      </BaseLink>
    </div>
  </BaseBlock>
</template>
