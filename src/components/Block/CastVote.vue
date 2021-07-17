<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  proposal: {
    type: Object,
    required: true
  },
  modelValue: [Array, Number, Object]
});

const emit = defineEmits(['update:modelValue', 'clickVote']);

const selectedChoices = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.length;
  if (typeof props.modelValue === 'object' && props.modelValue !== null)
    return Object.keys(props.modelValue).length;
  return props.modelValue;
});

function emitChoice(c) {
  emit('update:modelValue', c);
}
</script>

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
      <VotingQuadratic
        v-if="proposal.type === 'quadratic' || proposal.type === 'weighted'"
        :proposal="proposal"
        @selectChoice="emitChoice"
      />
      <VotingRankedChoice
        v-if="proposal.type === 'ranked-choice'"
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
