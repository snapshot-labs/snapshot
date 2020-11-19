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
        Add market
      </UiButton>
      <div v-else>
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
        <UiButton @click="removeAction" class="width-full mb-2">
          Remove action
        </UiButton>
      </div>
    </div>
    <UiButton @click="handleSubmit" class="button--submit width-full">
      {{ choice === proposal.choices.length ? 'Confirm' : 'Preview' }}
    </UiButton>
  </form>
</template>

<script>
export default {
  props: ['value', 'proposal'],
  data() {
    return {
      input: false,
      choice: 1
    };
  },
  computed: {
    canAddAction() {
      return !this.input.conditionId;
    }
  },
  mounted() {
    if (this.value) return (this.input = this.value);
    this.input = Object.fromEntries(
      this.proposal.choices.map((choice, i) => [`choice${i + 1}`, false])
    );
  },
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/davidalbela/snapshot.js/feature/add-pregov-omen-plugin/src/plugins/omen/logo.png`;
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
      if (this.choice === this.proposal.choices.length) {
        this.$emit('input', this.input);
        this.$emit('close');
        this.choice = 1;
      } else {
        this.choice++;
      }
    }
  }
};
</script>
