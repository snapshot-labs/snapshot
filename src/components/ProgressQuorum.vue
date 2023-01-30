<script setup lang="ts">
import { useIntl } from '@/composables';

const { formatCompactNumber, formatPercentNumber } = useIntl();

defineProps<{
  score: number;
  total: number;
  loading?: boolean;
  warning?: string;
}>();
</script>

<template>
  <div class="text-skin-link">
    <div class="flex justify-between">
      <div class="flex items-center gap-1">
        {{ $t('settings.quorum.label') }}
        <BaseButtonIcon
          v-if="warning"
          v-tippy="{ content: warning || null }"
          class="cursor-help p-0"
        >
          <i-ho-exclamation-circle class="text-sm" />
        </BaseButtonIcon>
      </div>
      <LoadingSpinner v-if="loading" class="mr-1" />
      <div v-else class="flex gap-2">
        <i-ho-check
          v-if="total && score >= total"
          class="text-skin-success text-green"
        />
        <span v-tippy="{ content: formatPercentNumber(score / total) }">
          {{ formatCompactNumber(score) }}
          /
          {{ formatCompactNumber(total) }}
        </span>
      </div>
    </div>
    <BaseProgressBar :value="(score / total) * 100" />
  </div>
</template>
