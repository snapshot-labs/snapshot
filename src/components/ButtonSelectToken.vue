<script setup lang="ts">
import { TokenlistToken } from '@/helpers/interfaces';

const props = defineProps<{
  network: string;
  tokens: TokenlistToken[];
  selectedToken: string;
}>();

defineEmits(['update:selectedToken']);

const isTokenModalOpen = ref(false);

const token = computed(() =>
  props.tokens.find(token => token.address === props.selectedToken)
);
</script>

<template>
  <TuneButtonSelect label="Token" @select="isTokenModalOpen = true">
    <div v-if="token?.address" class="flex flex-row space-x-2">
      <AvatarToken :address="token.address" />
      <span v-if="token">{{ token.name }}</span>
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
