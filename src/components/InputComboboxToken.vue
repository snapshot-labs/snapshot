<script setup lang="ts">
import { Token } from '@/helpers/alchemy';

defineProps<{
  label: string;
  network: string;
  tokens: Token[];
  amount: string;
  selectedToken?: Token;
  loading?: boolean;
  error?: string;
}>();

defineEmits(['update:selectedToken', 'update:amount']);

const { web3Account } = useWeb3();
const { modalAccountOpen } = useModal();

const isTokenModalOpen = ref(false);

function handleOpenTokenModal() {
  if (!web3Account.value) return (modalAccountOpen.value = true);
  isTokenModalOpen.value = true;
}
</script>

<template>
  <TuneInput
    :model-value="amount"
    :label="label"
    :error="error"
    always-show-error
    placeholder="0.0"
    type="number"
    class="pr-[142px]"
    @update:model-value="$emit('update:amount', $event)"
  >
    <template #after>
      <button
        type="button"
        label="Token"
        class="-mr-[23px] h-[40px] hover:bg-[--border-color-subtle] rounded-r-full border-l"
        @click="handleOpenTokenModal"
      >
        <div
          class="flex flex-row space-x-2 items-center pr-[12px] pl-3 max-w-[150px]"
        >
          <template v-if="loading">
            <TuneLoadingSpinner />
          </template>
          <template v-else-if="selectedToken?.contractAddress">
            <AvatarToken :address="selectedToken.contractAddress" size="20" />
            <span class="text-skin-link truncate">{{
              selectedToken.symbol
            }}</span>
          </template>
          <template v-else>
            <div>Select token</div>
          </template>
          <i-ho-chevron-down class="text-sm text-skin-link shrink-0" />
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
      @close="isTokenModalOpen = false"
    />
  </teleport>
</template>
