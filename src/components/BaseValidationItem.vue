<script setup>
import { useIntl } from '@/composables/useIntl';
import { useValidationsFilter } from '@/composables/useValidationsFilter';

const { formatCompactNumber } = useIntl();
const { validationsSpacesCount } = useValidationsFilter();

defineProps(['validation']);
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
