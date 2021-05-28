<template>
  <UiCollapsible
    :title="title"
    :number="index + 1"
    :open="open"
    @toggle="open = !open"
    @remove="$emit('remove')"
  >
    <UiSelect v-model="type">
      <template v-slot:label>type</template>
      <option value="contractInteraction">Contract Interaction</option>
      <option value="transferFunds">Transfer Funds</option>
      <option value="sendAsset">Send Asset</option>
    </UiSelect>
    <PluginSafeSnapFormContractInteraction
      v-if="type === 'contractInteraction'"
      :modelValue="modelValue"
      :network="network"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
      @valid="$emit('valid', $event)"
    />
  </UiCollapsible>
</template>

<script>
const labels = {
  contractInteraction: 'Contract Interaction',
  transferFunds: 'Transfer Funds',
  sendAsset: 'Send Asset'
};
export default {
  props: ['modelValue', 'index', 'nonce', 'network'],
  emits: ['update:modelValue', 'valid', 'remove'],
  data() {
    return {
      open: true,
      types: ['contractInteraction', 'transferFunds', 'sendAsset'],
      type: 'contractInteraction'
    };
  },
  computed: {
    title() {
      try {
        if (
          this.modelValue?.type === 'contractInteraction' &&
          this.modelValue?.to &&
          this.modelValue?.abi &&
          this.modelValue?.value
        ) {
          const [{ name: methodName }] = this.modelValue.abi;
          return `${methodName}() - ${
            this.modelValue.value
          } wei to ${this._shorten(this.modelValue.to)}`;
        }
      } catch (error) {
        console.log('could not determine title');
      }
      return this.getLabel(this.type);
    }
  },
  methods: {
    getLabel(type) {
      return labels[type];
    }
  }
};
</script>
