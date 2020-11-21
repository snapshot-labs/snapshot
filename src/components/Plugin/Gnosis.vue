<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2 text-center">
      <img class="circle" :src="getLogoUrl()" width="64" height="64" />
      <h4 class="mb-3">Market Details</h4>
      <UiButton
        @click="addAction"
        :disabled="!canAddAction"
        v-if="!input"
        class="width-full mb-2"
      >
        Add Market
      </UiButton>
      <div v-else-if="!this.preview">
        <UiButton class="width-full mb-2">
          <input
            v-model="input.conditionId"
            class="input width-full text-center"
            placeholder="Condition ID"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <input
            v-model="input.baseTokenAddress"
            class="input width-full text-center"
            placeholder="Base token address"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <input
            v-model="input.quoteCurrencyAddress"
            class="input width-full text-center"
            placeholder="Quote currency address"
            required
          />
        </UiButton>
        <UiButton
          v-if="
            input.conditionId &&
              input.baseTokenAddress &&
              input.quoteCurrencyAddress
          "
          @click="removeAction"
          class="width-full mb-2"
        >
          Remove action
        </UiButton>
      </div>
    </div>
    <div v-if="this.preview">
      <BlockPriceImpact
        v-if="
          this.$auth.web3 &&
            input.conditionId &&
            input.baseTokenAddress &&
            input.quoteCurrencyAddress
        "
        :conditionId="input.conditionId"
        :baseTokenAddress="input.baseTokenAddress"
        :quoteCurrencyAddress="input.quoteCurrencyAddress"
      />
      <UiButton @click="backAction" class="width-full mb-2">
        Back
      </UiButton>
    </div>
    <UiButton @click="handleSubmit" class="button--submit width-full">
      {{ preview ? 'Confirm' : 'Preview' }}
    </UiButton>
  </form>
</template>

<script>
export default {
  props: ['value', 'proposal'],
  data() {
    return {
      input: false,
      preview: false
    };
  },
  computed: {
    canAddAction() {
      return !this.input.conditionId;
    }
  },
  mounted() {
    if (this.value) return (this.input = this.value);
  },
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/davidalbela/snapshot.js/feature/add-pregov-omen-plugin/src/plugins/gnosis/logo.png`;
    },
    addAction() {
      if (!this.input) this.input = {};
      this.input = {
        conditionId: '',
        baseTokenAddress: '',
        quoteCurrencyAddress: ''
      };
    },
    removeAction() {
      this.input = false;
    },
    backAction() {
      this.preview = false;
    },
    handleSubmit() {
      if (this.preview) {
        this.$emit('input', this.input);
        this.$emit('close');
        this.preview = false;
      } else {
        this.preview = true;
      }
    }
  }
};
</script>
