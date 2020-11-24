<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2 text-center">
      <h4 class="mb-3">Market details</h4>
      <UiButton @click="addAction" v-if="!input" class="width-full mb-2">
        Add market
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
        <UiButton v-if="input" @click="removeAction" class="width-full mb-2">
          Remove market
        </UiButton>
      </div>
    </div>
    <div v-if="this.preview">
      <PluginGnosisBlock :proposalConfig="input" :choices="this.getChoices()" />
    </div>
    <UiButton
      v-if="!preview && input"
      :disabled="!isValid && input !== false"
      @click="preview = true"
      class="width-full mb-2"
    >
      Preview
    </UiButton>
    <UiButton v-if="preview" @click="preview = false" class="width-full mb-2">
      Back
    </UiButton>
    <UiButton
      :disabled="!isValid"
      @click="handleSubmit"
      class="button--submit width-full"
    >
      Confirm
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
    isValid() {
      return (
        (this.input.conditionId &&
          this.input.baseTokenAddress &&
          this.input.quoteCurrencyAddress) ||
        this.input === false
      );
    }
  },
  mounted() {
    if (this.value) return (this.input = this.value);
  },
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/plugins/gnosis/logo.png`;
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
    handleSubmit() {
      this.$emit('input', this.input);
      this.$emit('close');
    },
    getChoices() {
      return this.proposal.choices.map(choice => choice.text);
    }
  }
};
</script>
