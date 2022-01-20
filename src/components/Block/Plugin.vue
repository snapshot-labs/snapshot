<script setup>
import { useApp } from '@/composables/useApp';
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

const { explore } = useApp();

defineProps({
  plugin: Object
});
</script>

<template>
  <Block class="hover-border">
    <div class="flex items-center mb-1">
      <a target="_blank" class="flex items-center">
        <UiAvatar
          class="mr-2 mb-2"
          :imgsrc="plugin.icon"
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
        {{ $tc('inSpaces', [formatCompactNumber(explore.plugins[plugin.key] || 0)]) }}
      </div>
      <UiButton slim>
        <a
          @click.stop
          target="_blank"
          :href="`https://github.com/snapshot-labs/snapshot-plugins/tree/master/src/plugins/${plugin.key}`"
        >
          {{ $t('learnMore') }}
          <Icon name="external-link" class="text-color" />
        </a>
      </UiButton>
    </div>
  </Block>
</template>
