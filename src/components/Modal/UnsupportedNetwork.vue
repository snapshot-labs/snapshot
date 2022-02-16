<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true
  }
});
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('settings.unsupportedNetwork') }}</h3>
    </template>

    <div class="m-4">
      Creating a space is only supported on the Ethereum mainnet. To continue,
      please switch your wallet to the mainnet.
    </div>
    <template v-slot:footer>
      <UiButton class="button-outline w-full mb-2" :primary="true">
        Switch to mainnet
      </UiButton>
    </template>
  </UiModal>
</template>
