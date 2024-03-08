<script setup lang="ts">
import camelCase from 'lodash/camelCase';

const props = defineProps<{
  open: boolean;
  errorCode: null | Error;
}>();

defineEmits(['close']);

const errorMessageKeyPrefix = computed(() => {
  const knownErrors = ['PENDING_GENERATION', 'UNSUPPORTED_ENV'];

  return `proposal.downloadCsvVotes.postDownloadModal.message.${camelCase(
    knownErrors.includes(props.errorCode?.message as string)
      ? props.errorCode?.message
      : 'UNKNOWN_ERROR'
  )}`;
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>
          {{ $t('proposal.downloadCsvVotes.postDownloadModal.title') }}
        </h3>
      </div>
    </template>

    <div class="m-4 text-center">
      <i-ho-clock
        v-if="errorCode?.message === 'PENDING_GENERATION'"
        class="mx-auto my-4 text-center text-[3em]"
      />
      <i-ho-exclamation
        v-else
        class="mx-auto my-4 text-center text-[3em] text-red"
      />
      <h3>
        {{ $t(`${errorMessageKeyPrefix}.title`) }}
      </h3>
      <p class="mt-3 italic">
        {{ $t(`${errorMessageKeyPrefix}.description`) }}
      </p>
    </div>

    <template #footer>
      <TuneButton class="w-full" primary @click="$emit('close')">
        {{ $t('close') }}
      </TuneButton>
    </template>
  </BaseModal>
</template>
