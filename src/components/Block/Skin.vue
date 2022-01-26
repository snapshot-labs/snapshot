<script setup>
import { useIntl } from '@/composables/useIntl';
import { useSkins } from '@/composables/useSkins';

const { skinsSpacesCount } = useSkins();

const { formatCompactNumber } = useIntl();

defineProps(['skin']);
</script>

<template>
  <div :class="skin" class="bg-black rounded-none md:rounded-md">
    <Block>
      <UiButton class="mb-2" primary>{{ skin }}</UiButton>
      <div class="text-color">
        {{
          $tc('inSpaces', [formatCompactNumber(skinsSpacesCount[skin] ?? 0)])
        }}
      </div>
    </Block>
  </div>
</template>
