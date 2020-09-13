<template>
  <div v-if="input">
    <div class="mb-3 text-center">
      <h4 v-text="`Choice ${choice}`" class="mb-3" />
      <UiButton class="width-full mb-3">
        <input
          v-model="input[`choice${choice}`].actions[0].to"
          class="input width-full text-center"
          placeholder="To"
        />
      </UiButton>
      <div class="mb-2">
        <UiButton
          v-for="(data, i) in input[`choice${choice}`].actions[0].data"
          :key="i"
          class="d-flex width-full mb-2"
        >
          <span class="mr-4">{{ i + 1 }}</span>
          <input
            v-model="input[`choice${choice}`].actions[0].data[i]"
            class="input width-full text-center"
            placeholder="Data"
          />
          <span class="ml-4">
            <Icon name="close" size="12" />
          </span>
        </UiButton>
      </div>
      <UiButton @click="addData" class="width-full">
        Add data
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
              to: '',
              data: ['']
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
