<template>
  <UiCollapsible
    :hideRemove="preview"
    :number="index + 1"
    :open="open"
    :title="title"
    @remove="$emit('remove')"
    @toggle="open = !open"
  >
    <UiSelect v-model="type" :disabled="preview">
      <template v-slot:label>type</template>
      <option value="contractInteraction">Contract Interaction</option>
      <option value="raw">Raw Transaction</option>
      <!--      <option value="transferFunds">Transfer Funds</option>-->
      <!--      <option value="sendAsset">Send Asset</option>-->
    </UiSelect>

    <PluginSafeSnapFormContractInteraction
      v-if="type === 'contractInteraction'"
      :modelValue="modelValue"
      :network="network"
      :nonce="nonce"
      :preview="preview"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <PluginSafeSnapFormRawTransaction
      v-if="type === 'raw'"
      :modelValue="modelValue"
      :nonce="nonce"
      :preview="preview"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </UiCollapsible>
</template>

<script>
const labels = {
  contractInteraction: 'Contract Interaction',
  transferFunds: 'Transfer Funds',
  sendAsset: 'Send Asset',
  raw: 'Raw Transaction'
};
export default {
  props: ['modelValue', 'index', 'nonce', 'network', 'preview'],
  emits: ['update:modelValue', 'remove'],
  data() {
    let type = 'contractInteraction';
    if (this.modelValue) {
      type = this.modelValue.type ? this.modelValue.type : 'raw';
    }

    return {
      open: !this.preview,
      types: ['contractInteraction', 'transferFunds', 'sendAsset'],
      type
    };
  },
  mounted() {
    if (!this.preview) this.$emit('update:modelValue', undefined);
  },
  computed: {
    title() {
      if (this.modelValue) {
        try {
          const addr = this._shorten(this.modelValue.to);
          const type = this.modelValue.type || this.type;
          switch (type) {
            case 'contractInteraction':
              return `${this.modelValue.abi[0].name}() - ${this.modelValue.value} wei to ${addr}`;
            case 'raw':
              return `Send ${this.modelValue.value} wei to ${addr}`;
          }
        } catch (error) {
          console.log('could not determine title', error);
        }
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
