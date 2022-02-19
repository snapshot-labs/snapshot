<script setup>
import { useIntl } from '@/composables/useIntl';
import { useValidationsFilter } from '@/composables/useValidationsFilter';

const { formatCompactNumber } = useIntl();
const { validationsSpacesCount } = useValidationsFilter();

defineProps(['validation']);
</script>

<template>
  <Block>
    <div class="flex items-center mb-1">
      <h3 v-text="validation" />
    </div>
    <div class="text-skin-text">
      {{
        $tc('inSpaces', [
          formatCompactNumber(validationsSpacesCount?.[validation] ?? 0)
        ])
      }}
    </div>
  </Block>
</template>
