<script setup>
import { useIntl } from '@/composables/useIntl';
import { useSkinsFilter } from '@/composables/useSkinsFilter';

const { skinsSpacesCount } = useSkinsFilter();

const { formatCompactNumber } = useIntl();

defineProps(['skin']);
</script>

<template>
  <div :class="skin" class="rounded-none md:rounded-md cursor-pointer">
    <Block class="!bg-black">
      <UiButton class="mb-2" primary>{{ skin }}</UiButton>
      <div class="text-skin-text">
        {{
          $tc('inSpaces', [formatCompactNumber(skinsSpacesCount[skin] ?? 0)])
        }}
      </div>
    </Block>
  </div>
</template>
