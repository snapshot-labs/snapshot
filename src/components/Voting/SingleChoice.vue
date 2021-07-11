<script>
import { ref } from 'vue';

export default {
  props: {
    proposal: {
      type: Object,
      required: true
    }
  },
  emits: ['selectChoice'],
  setup(_, { emit }) {
    const selectedChoice = ref(null);

    function selectChoice(i) {
      selectedChoice.value = i;
      emit('selectChoice', i);
    }

    return { selectChoice, selectedChoice };
  }
};
</script>

<template>
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
</template>
