<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2 text-center">
      <h4 v-text="`Choice ${choice}`" class="mb-3" />
      <UiButton
        @click="addAction"
        :disabled="!canAddAction"
        v-if="!input || !input[`choice${choice}`]"
        class="width-full mb-2"
      >
        Add action
      </UiButton>
      <div v-else>
        <UiButton class="width-full mb-2">
          <input
            v-model="input[`choice${choice}`].actions[0].targetAddress"
            class="input width-full text-center"
            placeholder="Target address"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <input
            v-model="input[`choice${choice}`].actions[0].calldata"
            class="input width-full text-center"
            placeholder="Call data"
            required
          />
        </UiButton>
        <UiButton @click="removeAction" class="width-full mb-2">
          Remove action
        </UiButton>
      </div>
    </div>
    <UiButton @click="handleSubmit" class="button--submit width-full">
      {{ choice === proposal.choices.length ? 'Confirm' : 'Next' }}
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
      const choicesWithActions = this.proposal.choices.filter(
        (choice, i) => this.input[`choice${i + 1}`]
      );
      return this.proposal.choices.length - 1 > choicesWithActions.length;
    }
  },
  mounted() {
    if (this.value) return (this.input = this.value);
    this.input = Object.fromEntries(
      this.proposal.choices.map((choice, i) => [`choice${i + 1}`, false])
    );
  },
  methods: {
    addAction() {
      if (!this.input) this.input = {};
      this.input[`choice${this.choice}`] = {
        actions: [
          {
            targetAddress: '',
            calldata: ''
          }
        ]
      };
    },
    removeAction() {
      this.input[`choice${this.choice}`] = false;
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
