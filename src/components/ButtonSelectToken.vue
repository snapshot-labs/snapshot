<script setup lang="ts">
import { TokenlistToken } from '@/helpers/interfaces';

const props = defineProps<{
  network: string;
  tokens: TokenlistToken[];
  selectedToken?: TokenlistToken;
}>();

defineEmits(['update:selectedToken']);

const isTokenModalOpen = ref(false);
</script>

<template>
  <TuneButtonSelect label="Token" @select="isTokenModalOpen = true">
    <div v-if="selectedToken?.address" class="flex flex-row space-x-2">
      <AvatarToken :address="selectedToken.address" />
      <span v-if="selectedToken">{{ selectedToken.name }}</span>
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
      @close="isTokenModalOpen = false"
    />
  </teleport>
</template>
