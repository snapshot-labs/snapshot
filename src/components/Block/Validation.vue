<script setup>
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

defineProps(['validation']);
</script>

<template>
  <Block>
    <div class="flex items-center mb-1">
      <h3 v-text="validation.name" />
    </div>
    <div class="text-color">
      {{ $tc('inSpaces', [formatCompactNumber(validation.spacesCount)]) }}
    </div>
  </Block>
</template>
