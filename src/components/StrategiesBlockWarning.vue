<script setup lang="ts">
const props = defineProps<{
  context?: 'setup' | 'settings';
  error?: string | Record<string, any>;
}>();

const strategyTestnetErrors = computed(() => {
  if (typeof props.error === 'object') {
    const entries = Object.entries(props.error).filter(e => e[1].network);
    return entries.filter(e => e[1].network === 'Testnet not allowed.');
  }
});
</script>

<template>
  <div v-if="error" class="mt-3">
    <BaseMessageBlock
      v-if="error === 'ticketWithAnyOrBasicError'"
      level="warning-red"
    >
      <i18n-t
        :keypath="
          context === 'setup'
            ? 'ticketWithAnyOrBasicErrorSetup'
            : 'ticketWithAnyOrBasicError'
        "
        tag="span"
        scope="global"
      >
        <template #article>
          <BaseLink
            link="https://snapshot.mirror.xyz/-uSylOUP82hGAyWUlVn4lCg9ESzKX9QCvsUgvv-ng84"
          >
            {{ $t('learnMore') }}
          </BaseLink>
        </template>
      </i18n-t>
    </BaseMessageBlock>
    <MessageWarningTestnet
      v-else-if="strategyTestnetErrors"
      context="Strategy"
      :error="error"
    />

    <BaseMessageBlock v-else level="warning-red">
      {{ error }}
    </BaseMessageBlock>
  </div>
</template>
