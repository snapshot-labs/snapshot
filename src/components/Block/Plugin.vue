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
  <Block class="hover-border">
    <div class="flex items-center mb-1">
      <a target="_blank" class="flex items-center">
        <UiAvatar
          class="mr-2"
          :imgsrc="getIpfsUrl(plugin.icon)"
          :seed="plugin.name.charCodeAt()"
          size="28"
        />
        <h3 v-text="plugin.name" />
      </a>
      <div class="ml-1">v{{ plugin.version }}</div>
    </div>
    <div class="flex justify-between items-end text-color">
      <div class="flex flex-col">
        <a
          :href="`https://github.com/${plugin.author}`"
          target="_blank"
          class="text-color"
        >
          <Icon name="github" class="mr-1" />
          {{ plugin.author }}
        </a>
        {{
          $tc('inSpaces', [
            formatCompactNumber(pluginsSpacesCount?.[plugin.key] ?? 0)
          ])
        }}
      </div>
      <a
        class="flex items-center"
        @click.stop
        target="_blank"
        :href="`https://github.com/snapshot-labs/snapshot-plugins/tree/master/src/plugins/${plugin.key}`"
      >
        {{ $t('learnMore') }}
        <Icon size="16" name="external-link" class="text-color ml-1" />
      </a>
    </div>
  </Block>
</template>
