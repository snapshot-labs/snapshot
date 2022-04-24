<script setup lang="ts">
import { defineEmits, ref, watch, computed } from 'vue';
import { useEns } from '@/composables/useEns';
import { isAddress } from '@ethersproject/address';
import { useWeb3 } from '@/composables/useWeb3';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();
const { web3Account } = useWeb3();
const { validEnsTlds, isValidEnsDomain } = useEns();

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

const ValidateTo = computed(() => {
  if (form.value.address === '') return '';
  const address = form.value.address;
  if (!isValidEnsDomain(address) && !isAddress(address)) {
    if (address.includes('.'))
      return `${t('delegate.noValidEns')} ${t(
        'setup.supportedEnsTLDs'
      )}: ${validEnsTlds.join(', ')}`;
    else return t('delegate.noValidAddress');
  }
  if (address.toLowerCase() === web3Account.value.toLowerCase())
    return t('delegate.delegateToSelf');
  return '';
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
        :error="ValidateTo"
        instant-error
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
