<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
  isSending: boolean;
  isValid: boolean;
}>();

const emit = defineEmits(['showErrors', 'reactivateSpace']);

onMounted(() => {
  emit('showErrors');
});
</script>

<template>
  <BaseMessageBlock level="warning-red" is-responsive>
    <div v-if="isValid">
      {{ $t('settings.reactivatingHibernatedSpace.information') }}
    </div>

    <div v-else>
      {{ $t('settings.reactivatingHibernatedSpace.disabledInformation') }}
    </div>

    <TuneButton
      primary
      :loading="isSending"
      :disabled="!isValid"
      class="mt-3 whitespace-nowrap"
      @click="emit('reactivateSpace')"
    >
      {{ $t('reactivateSpace') }}
    </TuneButton>
  </BaseMessageBlock>
</template>
