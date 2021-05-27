<template>
  <UiSelect v-model="type">
    <template v-slot:label>type</template>
    <option value="contractInteraction">Contract Interaction</option>
    <option value="transferFunds">Transfer Funds</option>
    <option value="sendAsset">Send Asset</option>
  </UiSelect>

  <PluginSafeSnapFormContractInteraction
    v-if="type === 'contractInteraction'"
    :input="input"
    :network="network"
    :nonce="input.txs.length"
    @close="$emit('close')"
    @newTransaction="$emit('newTransaction', $event)"
  />
</template>

<script>
export default {
  props: ['input', 'nonce', 'network'],
  emits: ['newTransaction', 'close'],
  data() {
    return {
      type: 'contractInteraction'
    };
  },
  methods: {}
};
</script>
