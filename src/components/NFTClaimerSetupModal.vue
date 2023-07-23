<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
  open: boolean;
}>();

defineEmits(['close']);

const formRef = ref<any>(null);

function submit() {
  formRef.value?.submit();
}
</script>

<template>
  <BaseModal max-height="550px" :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('Setup SnapIt!') }}</h3>
    </template>
    <template #default>
      <form class="flex flex-col justify-between gap-y-4 p-4">
        <NFTClaimerSettingForm ref="formRef" :space="space" />
        <BaseButton primary class="w-full" type="submit" @click="submit">
          Setup SnapIt!
        </BaseButton>
      </form>
    </template>
  </BaseModal>
</template>
