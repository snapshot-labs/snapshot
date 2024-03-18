<script>
import Plugin, {
  getERC721TokenTransferTransactionData,
  sendAssetToModuleTransaction
} from '../../index';
import { isAddress } from '@ethersproject/address';
import { shorten } from '@/helpers/utils';
import SafeSnapInputAddress from '../Input/Address.vue';

export default {
  components: { SafeSnapInputAddress },
  props: ['modelValue', 'nonce', 'config', 'isDetails'],
  emits: ['update:modelValue'],
  setup() {
    return { shorten };
  },
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
  watch: {
    modelValue(newValue) {
      this.updateInternalState(newValue);
    },
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
  methods: {
    updateInternalState(newValue) {
      if (newValue) {
        const { recipient = '', collectable } = newValue;
        this.to = recipient;
        if (collectable) {
          this.collectableAddress = collectable.address;
          this.collectables = [collectable];
        }
      } else {
        this.to = '';
        this.collectableAddress = '';
      }
    },
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
      if (!this.config.preview && this.config.collectables?.results) {
        this.collectables = this.config.collectables.results;
        if (!this.selectedCollectable && this.collectables.length) {
          this.collectableAddress = this.collectables[0].address;
        }
      }
    }
  }
};
</script>

<template>
  <div>
    <div v-if="isDetails" class="my-2 flex flex-col space-y-2 px-3">
      <div class="flex space-x-2">
        <p class="text-skin-text">{{ $t('safeSnap.asset') }}</p>
        <div v-if="selectedCollectable" class="flex space-x-2">
          <div
            v-if="selectedCollectable.imageUri || selectedCollectable.logoUri"
          >
            <img
              :src="selectedCollectable.imageUri || selectedCollectable.logoUri"
              alt=""
              class="tokenImage"
            />
          </div>

          <div v-if="selectedCollectable.name || selectedCollectable.tokenName">
            {{ selectedCollectable.name ?? selectedCollectable.tokenName }} #{{
              shorten(selectedCollectable.id, 10)
            }}
          </div>
        </div>
      </div>
      <div class="flex space-x-2">
        <p class="text-skin-text">{{ $t('safeSnap.to') }}</p>
        <p>
          {{ shorten(to) }}
        </p>
      </div>
    </div>
    <div v-if="!isDetails">
      <UiSelect
        :custom-styles="'safesnap-custom-select'"
        v-model="collectableAddress"
        :disabled="config.preview"
      >
        <template #label>{{ $t('safeSnap.asset') }}</template>
        <template
          v-if="
            selectedCollectable &&
            (selectedCollectable.imageUri || selectedCollectable.logoUri)
          "
          #image
        >
          <img
            :src="selectedCollectable.imageUri || selectedCollectable.logoUri"
            alt=""
            class="tokenImage"
          />
        </template>
        <option v-if="!collectables.length" disabled selected>
          - {{ $t('safeSnap.noCollectibles') }} -
        </option>
        <option
          v-for="(collectable, index) in collectables"
          :key="index"
          :value="collectable.address"
        >
          {{ collectable.name ?? collectable.tokenName }} #{{
            shorten(collectable.id, 10)
          }}
        </option>
      </UiSelect>

      <SafeSnapInputAddress
        v-model="to"
        :disabled="config.preview"
        :input-props="{
          required: true
        }"
        :label="$t('safeSnap.to')"
      />
    </div>
  </div>
</template>

<style scoped>
.tokenImage {
  width: 24px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
