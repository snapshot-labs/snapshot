<script setup lang="ts">
import { defineEmits, ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  userAddress: string;
  spaceId: string;
}>();

defineEmits(['close']);

const form = ref({
  id: '',
  address: ''
});

watch(
  () => props.open,
  () => {
    form.value = {
      id: props.spaceId,
      address: props.userAddress
    };
  },
  { immediate: true }
);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('delegate') }}</h3>
      </div>
    </template>
    <div class="p-4 space-y-3">
      <SBaseInput
        v-model.trim="form.address"
        :title="$t('delegator address')"
        :placeholder="$t('delegate.addressPlaceholder')"
        readonly
      >
        <template v-slot:label>{{ $t('delegate.to') }}</template>
      </SBaseInput>
      <SBaseInput
        v-model.trim="form.id"
        :title="$t('space id')"
        placeholder="e.g. balancer.eth"
        readonly
      >
        <template v-slot:label>{{ $t('space') }}</template>
      </SBaseInput>
    </div>
  </BaseModal>
</template>
