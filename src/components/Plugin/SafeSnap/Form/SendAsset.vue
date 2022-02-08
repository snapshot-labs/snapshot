<script>
import Plugin, {
  getERC721TokenTransferTransactionData,
  sendAssetToModuleTransaction
} from '@/../snapshot-plugins/src/plugins/safeSnap';
import { isAddress } from '@ethersproject/address';
import { shorten } from '@/helpers/utils';

export default {
  setup() {
    return { shorten };
  },
  props: ['modelValue', 'nonce', 'config'],
  emits: ['update:modelValue'],
  data() {
    return {
      plugin: new Plugin(),
      collectables: [],
      loading: false,

      to: '',
      collectableAddress: ''
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
      const { recipient = '', collectable } = this.modelValue;
      this.to = recipient;
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
    config() {
      this.setCollectables();
    }
  },
  methods: {
    updateTransaction() {
      if (this.config.preview) return;
      try {
        if (isAddress(this.to)) {
          const data = getERC721TokenTransferTransactionData(
            this.config.gnosisSafeAddress,
            this.to,
            this.selectedCollectable.id
          );

          const transaction = sendAssetToModuleTransaction({
            data,
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

<template>
  <UiSelect v-model="collectableAddress" :disabled="config.preview">
    <template v-slot:label>{{ $t('safeSnap.asset') }}</template>
    <template
      v-slot:image
      v-if="selectedCollectable && selectedCollectable.logoUri"
    >
      <img :src="selectedCollectable.logoUri" alt="" class="tokenImage" />
    </template>
    <option v-if="!collectables.length" disabled selected>
      - {{ $t('safeSnap.noCollectibles') }} -
    </option>
    <option
      v-for="(collectable, index) in collectables"
      :key="index"
      :value="collectable.address"
    >
      {{ collectable.name }} #{{ shorten(collectable.id, 10) }}
    </option>
  </UiSelect>

  <PluginSafeSnapInputAddress
    v-model="to"
    :disabled="config.preview"
    :inputProps="{
      required: true
    }"
    :label="$t('safeSnap.to')"
  />
</template>

<style scoped>
.tokenImage {
  width: 24px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
