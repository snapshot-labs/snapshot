<template>
  <UiSelect v-model="collectableAddress" :disabled="config.preview">
    <template v-slot:label>asset</template>
    <template v-slot:image v-if="selectedCollectable">
      <img :src="selectedCollectable.logoUri" alt="" class="tokenImage" />
    </template>
    <option v-if="!collectables.length" disabled selected>
      - No Collectables -
    </option>
    <option
      v-for="(collectable, index) in collectables"
      :key="index"
      :value="collectable.address"
    >
      {{ collectable.name }} #{{ _shorten(collectable.id, 10) }}
    </option>
  </UiSelect>

  <PluginSafeSnapInputAddress
    v-model="to"
    :disabled="config.preview"
    :inputProps="{
      required: true
    }"
    label="to"
  />

  <UiInput
    :disabled="config.preview"
    :error="!validValue && 'Invalid Value'"
    :modelValue="value"
    @update:modelValue="handleValueChange($event)"
  >
    <template v-slot:label>amount</template>
  </UiInput>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/safeSnap';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isAddress } from '@ethersproject/address';
import { parseAmount } from '@/helpers/utils';
import { getERC721TokenTransferTransactionData } from '@/helpers/abi/utils';

const shrinkCollectableData = collectable => {
  return {
    id: collectable.id,
    name: collectable.name,
    address: collectable.address,
    tokenName: collectable.tokenName,
    logoUri: collectable.logoUri
  };
};
const toModuleTransaction = ({
  recipient,
  value,
  collectable,
  data,
  nonce
}) => {
  return {
    type: 'sendAsset',
    operation: '0',
    to: collectable.address,
    value: parseAmount(value),
    data,
    nonce,
    collectable: shrinkCollectableData(collectable),
    recipient
  };
};
export default {
  props: ['modelValue', 'nonce', 'config'],
  emits: ['update:modelValue'],
  data() {
    return {
      plugin: new Plugin(),
      collectables: [],
      loading: false,

      to: '',
      value: '0',
      collectableAddress: '',

      validValue: true
    };
  },
  computed: {
    selectedCollectable() {
      if (!this.collectableAddress) return null;
      return this.collectables.find(
        collectable => collectable.address === this.collectableAddress
      );
    }
  },
  mounted() {
    this.setCollectables();
    if (this.modelValue) {
      const { recipient = '', collectable, value = '0' } = this.modelValue;
      this.to = recipient;
      this.handleValueChange(value);
      if (collectable) {
        this.collectableAddress = collectable.address;
        this.collectables = [collectable];
      }
    }
  },
  watch: {
    to() {
      this.updateTransaction();
    },
    collectableAddress() {
      this.updateTransaction();
    },
    value() {
      this.updateTransaction();
    },
    config() {
      this.setCollectables();
    }
  },
  methods: {
    updateTransaction() {
      if (this.config.preview) return;
      try {
        if (isBigNumberish(this.value) && isAddress(this.to)) {
          const data = getERC721TokenTransferTransactionData(
            this.config.gnosisSafeAddress,
            this.to,
            this.selectedCollectable.id
          );

          const transaction = toModuleTransaction({
            data,
            value: this.value,
            nonce: this.nonce,
            recipient: this.to,
            collectable: this.selectedCollectable
          });

          if (this.plugin.validateTransaction(transaction)) {
            this.$emit('update:modelValue', transaction);
            return;
          }
        }
      } catch (error) {
        console.warn('invalid transaction');
      }
      this.$emit('update:modelValue', undefined);
    },
    handleValueChange(value) {
      this.value = value;
      try {
        parseAmount(value);
        this.validValue = true;
      } catch (error) {
        this.validValue = false;
      }
    },
    setCollectables() {
      if (!this.config.preview && this.config.collectables) {
        this.collectables = this.config.collectables;
        if (!this.selectedCollectable && this.collectables.length) {
          this.collectableAddress = this.collectables[0].address;
        }
      }
    }
  }
};
</script>

<style scoped>
.tokenImage {
  width: 24px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
