<template>
  <div v-if="input">
    <div class="mb-2 text-center">
      <h4 v-text="`Choice ${choice}`" class="mb-3" />
      <UiButton class="width-full mb-2">
        <input
          v-model="input[`choice${choice}`].actions[0].targetAddress"
          class="input width-full text-center"
          placeholder="Target address"
        />
      </UiButton>
      <UiButton class="width-full mb-2">
        <input
          v-model="input[`choice${choice}`].actions[0].calldata"
          class="input width-full text-center"
          placeholder="Call data"
        />
      </UiButton>
    </div>
    <UiButton @click="handleSubmit" class="button--submit width-full">
      {{ choice === proposal.choices.length ? 'Confirm' : 'Next' }}
    </UiButton>
  </div>
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
  mounted() {
    if (this.value) return (this.input = this.value);
    this.input = Object.fromEntries(
      this.proposal.choices.map((choice, i) => [
        `choice${i + 1}`,
        {
          actions: [
            {
              targetAddress: '',
              calldata: ''
            }
          ]
        }
      ])
    );
  },
  methods: {
    addData() {
      this.input[`choice${this.choice}`].actions[0].data.push('');
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
