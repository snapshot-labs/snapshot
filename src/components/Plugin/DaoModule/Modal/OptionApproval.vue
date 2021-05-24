<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>Proposal Approval</h3>
    </template>
    <div class="m-4 mb-5 text-center">
      <h3>
        Did this proposal pass and does it fulfill the
        <a>acceptance criteria</a>?
      </h3>
      <div class="m-4">
        <h4>Current answer: {{ answer.current }}</h4>
        <h4>Current bond: {{ bond }} ETH</h4>
      </div>
      <div>
        <UiButton @click="handleSetApproval" class="button--submit">
          Set answer to {{ answer.desired }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script>
export default {
  props: ['open', 'isApproved', 'bond', 'questionId'],
  emits: ['close', 'setApproval'],
  methods: {
    async handleSetApproval() {
      await this.$emit('setApproval');
      this.$emit('close');
    },
    showQuestion() {
      window.open(
        'https://reality.eth.link/app/#!/question/' + this.questionId,
        '_blank'
      );
    }
  },
  computed: {
    answer() {
      return {
        current: this.isApproved ? 'Yes' : 'No',
        desired: this.isApproved ? 'No' : 'Yes'
      };
    }
  }
};
</script>
