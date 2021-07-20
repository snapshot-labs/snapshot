<script>
export default {
  props: { open: Boolean },
  emits: ['close']
};
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('walletNotice') }}</h3>
    </template>
    <div class="text-center my-2 p-4">
      <h4>{{ $t('gnosisSafeWalletNotice') }}</h4>
      <a
        href="https://help.gnosis-safe.io/en/articles/4820197-how-to-participate-in-a-snapshot-poll"
        target="_blank"
        rel="noopener noreferrer"
      >
        <UiText :text="$t('learnMore')" />
        <Icon name="external-link" class="ml-1" />
      </a>
    </div>
    <template v-slot:footer>
      <div>
        <UiButton
          @click="$emit('close')"
          type="submit"
          class="width-full button--submit"
        >
          {{ $t('continue') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
