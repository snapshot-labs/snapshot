<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';
import { PluginIndex } from '@/helpers/interfaces';

const { formatCompactNumber } = useIntl();
const { pluginsSpacesCount } = usePlugins();

defineProps<{
  plugin: PluginIndex;
}>();
</script>

<template>
  <BaseBlock>
    <div class="mb-2 flex items-center">
      <BaseAvatar
        v-if="plugin?.icon"
        class="mr-2"
        :src="getIpfsUrl(plugin.icon)"
        size="28"
      />
      <h3 class="m-0 truncate" v-text="plugin.name" />
      <div class="ml-1">v{{ plugin.version }}</div>
    </div>
    <div class="flex items-end justify-between text-skin-text">
      <div class="flex flex-col">
        <div class="text-skin-text">
          <BaseIcon name="github" class="mr-1" />
          {{ plugin.author }}
        </div>
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
