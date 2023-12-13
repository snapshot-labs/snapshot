<script setup lang="ts">
import { Token } from '@/helpers/alchemy';

const props = defineProps<{
  network: string;
  tokens: Token[];
  selectedToken?: Token;
}>();

defineEmits(['update:selectedToken', 'addCustomToken']);

const isTokenModalOpen = ref(false);
</script>

<template>
  <TuneButtonSelect
    label="Token"
    class="truncate"
    @select="isTokenModalOpen = true"
  >
    <div
      v-if="selectedToken?.contractAddress"
      class="flex flex-row space-x-2 pr-2"
    >
      <AvatarToken :address="selectedToken.contractAddress" />
      <span v-if="selectedToken" class="truncate">{{
        selectedToken.name
      }}</span>
      <span v-if="selectedToken"> ({{ selectedToken.symbol }}) </span>
    </div>
    <span v-else>Select token</span>
  </TuneButtonSelect>
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
