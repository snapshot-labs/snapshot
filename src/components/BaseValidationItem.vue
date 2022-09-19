<script setup lang="ts">
import { useIntl, useValidationsFilter } from '@/composables';

const { formatCompactNumber } = useIntl();
const { validationsSpacesCount } = useValidationsFilter();

defineProps<{
  validation: string;
}>();
</script>

<template>
  <BaseBlock class="cursor-pointer hover:!border-skin-text">
    <div class="mb-1 flex items-center">
      <h3 class="mt-0" v-text="validation" />
    </div>
    <div class="text-skin-text">
      {{
        $tc('inSpaces', [
          formatCompactNumber(validationsSpacesCount?.[validation] ?? 0)
        ])
      }}
    </div>
  </BaseBlock>
</template>
