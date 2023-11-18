<script setup lang="ts">
const props = defineProps<{
  context?: 'setup' | 'settings';
  error?: string | Record<string, any>;
}>();

const strategyNetworkErrors = computed(() => {
  if (typeof props.error === 'object') {
    const entries = Object.entries(props.error).filter(e => e[1].network);
    return entries;
  }
});
</script>

<template>
  <BaseMessageBlock v-if="error" level="warning-red" class="mt-3">
    <span v-if="error === 'ticketWithAnyOrBasicError'">
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
    </span>

    <span v-else-if="strategyNetworkErrors">
      Strategy {{ strategyNetworkErrors.map(e => Number(e[0]) + 1).join(', ') }}
      is using a test network which are no longer supported. If you are looking
      to test your strategies, please checkout
      <BaseLink link="https://demo.snapshot.org"> demo.snapshot.org</BaseLink>
    </span>

    <span v-else>
      {{ error }}
    </span>
  </BaseMessageBlock>
</template>
