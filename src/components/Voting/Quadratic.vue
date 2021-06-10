<template>
  <div class="mb-3">
    <span class="float-right mr-2"
      >Remaining credits: {{ remainingCredits(selectedChoices) }}</span
    >
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <UiButton
        class="d-block width-full mb-2"
        :class="selectedChoices[i + 1] > 0 && 'button--active'"
      >
        <span class="float-left">{{ _shorten(choice, 32) }}</span>
        <div class="d-flex flex-items-center float-right">
          <button
            :disabled="creditsSpent(i + 1, 'neg')"
            @click="!removeVote(i + 1)"
            style="width: 40px"
          >
            -
          </button>
          <div style="min-width: 25px">{{ selectedChoices[i + 1] || 0 }}</div>
          <button
            :disabled="creditsSpent(i + 1, 'pos')"
            @click="addVote(i + 1)"
            style="width: 40px"
          >
            +
          </button>
        </div>
      </UiButton>

      <PluginAragonGovern :proposal="proposal" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { quadraticCredits } from '@/helpers/voting/quadratic';
export default {
  props: {
    proposal: {
      type: Object,
      required: true
    }
  },
  emits: ['selectChoice'],
  setup(props, { emit }) {
    const selectedChoices = ref({});

    function remainingCredits(selectedChoices) {
      return 100 - quadraticCredits(selectedChoices);
    }

    function creditsSpent(i, sign) {
      const choicesClone = JSON.parse(JSON.stringify(selectedChoices.value));
      if (choicesClone[i] > 0) {
        choicesClone[i] = choicesClone[i] + 1;
        if (remainingCredits(choicesClone) < 0)
          return sign === 'pos' ? true : false;
      } else if (choicesClone[i] < 0) {
        choicesClone[i] = choicesClone[i] - 1;
        if (remainingCredits(choicesClone) < 0)
          return sign === 'neg' ? true : false;
      } else if (choicesClone[i] === 0) {
        if (remainingCredits(choicesClone) <= 0) return true;
      }
    }

    function addVote(i) {
      selectedChoices.value[i] = selectedChoices.value[i] += 1;
      emit('selectChoice', selectedChoices.value);
    }

    function removeVote(i) {
      selectedChoices.value[i] = selectedChoices.value[i] -= 1;
      emit('selectChoice', selectedChoices.value);
    }

    props.proposal.choices.forEach(
      (choice, i) => (selectedChoices.value[i + 1] = 0)
    );
    console.log(selectedChoices.value);

    return {
      addVote,
      removeVote,
      selectedChoices,
      remainingCredits,
      creditsSpent
    };
  }
};
</script>
