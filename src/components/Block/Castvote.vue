<template>
  <Block v-if="loaded" class="mb-4" :title="$t('proposal.castVote')">
    <div class="mb-3">
      <BlockVotingSingleChoice
        v-if="canVote('single-choice')"
        :proposal="proposal"
        @selectChoice="emitChoice"
      />
      <BlockVotingApproval
        v-if="canVote('approval')"
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
import { toRefs, computed } from 'vue';
export default {
  props: {
    proposal: {
      type: Object,
      requered: true
    },
    modelValue: [Array, Number],
    loaded: Boolean,
    ts: String
  },
  setup(props, { emit }) {
    const { ts, loaded, proposal, modelValue } = toRefs(props);

    const selectedChoices = computed(() => {
      if (Array.isArray(modelValue.value)) return modelValue.value.length;
      return modelValue.value;
    });

    function canVote(t) {
      console.log(ts.value, loaded.value);
      return (
        proposal.value.type === t &&
        loaded.value &&
        ts.value >= proposal.value.start &&
        ts.value < proposal.value.end
      );
    }

    function emitChoice(c) {
      emit('update:modelValue', c);
    }

    return { canVote, selectedChoices, emitChoice };
  }
};
</script>
