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
  <Block class="hover:border-skin-link">
    <div class="flex items-center mb-1">
      <a class="flex items-center">
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
    <div class="flex justify-between items-end text-skin-text">
      <div class="flex flex-col">
        <BaseLink
          class="text-skin-text"
          :link="`https://github.com/${plugin.author}`"
          hide-external-icon
        >
          <Icon name="github" class="mr-1" />
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
        :link="`https://github.com/snapshot-labs/snapshot-plugins/tree/master/src/plugins/${plugin.key}`"
      >
        {{ $t('learnMore') }}
      </BaseLink>
    </div>
  </Block>
</template>
