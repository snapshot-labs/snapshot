<script setup lang="ts">
defineProps<{
  transactionCount: number;
}>();
const emit = defineEmits<{
  executeProposal: [event: void];
}>();
</script>

<template>
  <div>
    <p>
      This will execute the transactions from this proposal and return the
      asserter's bond.
    </p>
    <BaseButton @click="emit('executeProposal')" class="w-full">
      Execute {{ transactionCount }} transaction{{
        transactionCount > 1 ? 's' : ''
      }}
    </BaseButton>
  </div>
</template>
