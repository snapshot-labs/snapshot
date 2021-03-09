<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2 text-center">
      <h4 v-text="$tc('yourChoice', [choice])" class="mb-3" />
      <UiButton
        @click="addAction"
        :disabled="!canAddAction"
        v-if="!input || !input[`choice${choice}`]"
        class="width-full mb-2"
      >
        {{ $t('addAction') }}
      </UiButton>
      <div v-else>
        <UiButton class="width-full mb-2">
          <input
            v-model="input[`choice${choice}`].actions[0].to"
            class="input width-full text-center"
            :placeholder="$t('targetAddress')"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <input
            v-model="input[`choice${choice}`].actions[0].value"
            class="input width-full text-center"
            :placeholder="$t('value')"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <input
            v-model="input[`choice${choice}`].actions[0].data"
            class="input width-full text-center"
            :placeholder="$t('data')"
            required
          />
        </UiButton>
        <UiButton @click="removeAction" class="width-full mb-2">
          {{ $t('removeAction') }}
        </UiButton>
      </div>
    </div>
    <UiButton @click="handleSubmit" class="button--submit width-full">
      {{ choice === proposal.choices.length ? $t('confirm') : $t('next') }}
    </UiButton>
  </form>
</template>

<script>
export default {
  props: ['modelValue', 'proposal'],
  emits: ['update:modelValue', 'close'],
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
    if (this.modelValue) return (this.input = this.modelValue);
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
            to: '',
            value: '',
            data: ''
          }
        ]
      };
    },
    removeAction() {
      this.input[`choice${this.choice}`] = false;
    },
    handleSubmit() {
      if (this.choice === this.proposal.choices.length) {
        this.$emit('update:modelValue', this.input);
        this.$emit('close');
        this.choice = 1;
      } else {
        this.choice++;
      }
    }
  }
};
</script>
