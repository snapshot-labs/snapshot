<script setup lang="ts">
import { Token } from '@/helpers/alchemy';

defineProps<{
  label: string;
  network: string;
  tokens: Token[];
  amount: string;
  selectedToken?: Token;
  loading?: boolean;
}>();

defineEmits(['update:selectedToken', 'addCustomToken', 'update:amount']);

const isTokenModalOpen = ref(false);
</script>

<template>
  <TuneInput
    :model-value="amount"
    :label="label"
    placeholder="0.0"
    type="number"
    @update:model-value="$emit('update:amount', $event)"
  >
    <template #after>
      <button
        type="button"
        label="Token"
        class="-mr-4 h-full bg-[--border-color-subtle] hover:bg-[--border-color-soft] rounded-r-full"
        @click="isTokenModalOpen = true"
      >
        <div
          v-if="selectedToken?.contractAddress || loading"
          class="flex flex-row space-x-2 items-center pr-[12px] pl-3"
        >
          <template v-if="loading">
            <LoadingSpinner />
          </template>
          <template v-else>
            <AvatarToken :address="selectedToken!.contractAddress" size="20" />
            <span v-if="selectedToken" class="text-skin-link">{{
              selectedToken.symbol
            }}</span>
          </template>
          <i-ho-chevron-down class="text-sm text-skin-link" />
        </div>
      </button>
    </template>
  </TuneInput>

  <teleport to="#modal">
    <ModalTokens
      :selected-token="selectedToken"
      :tokens="tokens"
      :open="isTokenModalOpen"
      :network="network"
      @update:selected-token="$emit('update:selectedToken', $event)"
      @add-custom-token="$emit('addCustomToken', $event)"
      @close="isTokenModalOpen = false"
    />
  </teleport>
</template>
