<script setup lang="ts">
const props = defineProps<{
  context: 'Treasury' | 'Strategy';
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
  <BaseMessageBlock
    v-if="strategyTestnetErrors"
    level="warning-red"
    class="mt-3"
  >
    {{ context }}
    #{{ strategyTestnetErrors.map(e => Number(e[0]) + 1).join(', ') }}
    is using a test network which is no longer supported. If you are looking to
    setup a space for testing, please checkout
    <BaseLink link="https://testnet.snapshot.org">
      testnet.snapshot.org</BaseLink
    >
  </BaseMessageBlock>
</template>
