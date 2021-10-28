<script>
export default {
  props: ['modelValue', 'proposal', 'network'],
  emits: ['update:modelValue', 'close'],
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
    if (this.modelValue) return (this.input = this.modelValue);
  },
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/gnosis/logo.png`;
    },
    addAction() {
      if (!this.input) this.input = {};
      this.input = {
        network: '1',
        conditionId: '',
        baseTokenAddress: '',
        quoteCurrencyAddress: ''
      };
    },
    removeAction() {
      this.input = false;
    },
    handleSubmit() {
      this.$emit('update:modelValue', this.input);
      this.$emit('close');
    },
    getChoices() {
      return this.proposal.choices.map(choice => choice.text);
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2 text-center">
      <h4 class="mb-3">{{ $t('marketDetails') }}</h4>
      <UiButton @click="addAction" v-if="!input" class="w-full mb-2">
        {{ $t('addMarket') }}
      </UiButton>
      <div v-else-if="!preview">
        <UiButton class="w-full mb-2">
          <select
            v-model="input.network"
            class="input w-full text-center"
            :placeholder="$t('selectNetwork')"
            required
          >
            <option value="1" selected>Mainnet</option>
            <option value="100">xDai</option>
          </select>
        </UiButton>
        <UiButton class="w-full mb-2">
          <input
            v-model="input.conditionId"
            class="input w-full text-center"
            :placeholder="$t('conditionId')"
            required
          />
        </UiButton>
        <UiButton class="w-full mb-2">
          <input
            v-model="input.baseTokenAddress"
            class="input w-full text-center"
            :placeholder="$t('basetokenAddress')"
            required
          />
        </UiButton>
        <UiButton class="w-full mb-2">
          <input
            v-model="input.quoteCurrencyAddress"
            class="input w-full text-center"
            :placeholder="$t('quoteAddress')"
            required
          />
        </UiButton>
        <UiButton v-if="input" @click="removeAction" class="w-full mb-2">
          {{ $t('removeMarket') }}
        </UiButton>
      </div>
    </div>
    <div v-if="preview">
      <PluginGnosisCustomBlock
        :proposalConfig="input"
        :choices="getChoices()"
      />
    </div>
    <UiButton
      v-if="!preview && input"
      :disabled="!isValid && input !== false"
      @click="preview = true"
      class="w-full mb-2"
    >
      {{ $t('create.preview') }}
    </UiButton>
    <UiButton v-if="preview" @click="preview = false" class="w-full mb-2">
      {{ $t('back') }}
    </UiButton>
    <UiButton :disabled="!isValid" @click="handleSubmit" class="w-full" primary>
      {{ $t('confirm') }}
    </UiButton>
  </form>
</template>
