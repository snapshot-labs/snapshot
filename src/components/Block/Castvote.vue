<template>
  <Block class="mb-4" :title="$t('proposal.castVote')">
    <div class="mb-3">
      <UiButton
        v-for="(choice, i) in proposal.choices"
        :key="i"
        @click="selectChoice(i + 1)"
        class="d-block width-full mb-2"
        :class="selectedChoice === i + 1 && 'button--active'"
      >
        {{ _shorten(choice, 32) }}
        <PluginAragonGovern :proposal="proposal" />
      </UiButton>
    </div>
    <UiButton
      :disabled="app.authLoading || !selectedChoice"
      @click="$emit('clickVote')"
      class="d-block width-full button--submit"
    >
      {{ $t('proposal.vote') }}
    </UiButton>
  </Block>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    proposal: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'open', 'clickVote'],
  setup(_, { emit }) {
    const selectedChoice = ref(null);

    function selectChoice(i) {
      selectedChoice.value = i;
      emit('update:modelValue', i);
    }

    return { selectChoice, selectedChoice };
  }
};
</script>
