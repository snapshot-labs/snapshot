<template>
  <span
    :aria-label="choicesString"
    class="text-center text-white tooltipped tooltipped-n"
  >
    {{ _shorten(choicesString, 20) }}</span
  >
</template>

<script>
export default {
  props: {
    proposal: {
      type: Object,
      required: true
    },
    choices: {
      type: Array,
      required: true
    }
  },
  computed: {
    choicesString() {
      return this.proposal.choices
        .filter(choice =>
          this.choices.includes(this.proposal.choices.indexOf(choice) + 1)
        )
        .map(choice => choice, 'choice')
        .join(', ');
    }
  }
};
</script>
