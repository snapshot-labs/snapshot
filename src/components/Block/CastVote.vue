<template>
  <Block class="mb-4" :title="$t('proposal.castVote')">
    <div class="mb-3">
      <VotingSingleChoice
        v-if="proposal.type === 'single-choice'"
        :proposal="proposal"
        @selectChoice="emitChoice"
      />
      <VotingApproval
        v-if="proposal.type === 'approval'"
        :proposal="proposal"
        @selectChoice="emitChoice"
      />
    </div>
    <UiButton
      :disabled="app.authLoading || selectedChoices < 1"
      @click="$emit('clickVote')"
      class="d-block width-full button--submit"
    >
      {{ $t('proposal.vote') }}
    </UiButton>
  </Block>
</template>

<script>
import { computed } from 'vue';
export default {
  props: {
    proposal: {
      type: Object,
      required: true
    },
    modelValue: [Array, Number]
  },
  setup(props, { emit }) {
    const selectedChoices = computed(() => {
      if (Array.isArray(props.modelValue)) return props.modelValue.length;
      return props.modelValue;
    });

    function emitChoice(c) {
      emit('update:modelValue', c);
    }

    return { selectedChoices, emitChoice };
  }
};
</script>
