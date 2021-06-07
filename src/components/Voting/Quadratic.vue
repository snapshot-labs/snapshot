<template>
  <div class="mb-3">
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <UiButton
        class="d-block width-full mb-2"
        :class="selectedChoices[i + 1] > 0 && 'button--active'"
      >
        <span class="float-left">{{ _shorten(choice, 32) }}</span>
        <div class="d-flex flex-items-center float-right">
          <a @click="removeVote(i + 1)" style="width: 40px">-</a>
          <div style="min-width: 25px">{{ selectedChoices[i + 1] || 0 }}</div>
          <a @click="addVote(i + 1)" style="width: 40px">+</a>
          <div style="min-width: 75px" class="text-right">
            {{ percentage(i) }} votes
          </div>
        </div>
      </UiButton>

      <PluginAragonGovern :proposal="proposal" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { numberOfVotes } from '@/helpers/utils';
export default {
  props: {
    proposal: {
      type: Object,
      required: true
    }
  },
  emits: ['selectChoice'],
  setup(_, { emit }) {
    const selectedChoices = ref({});

    function percentage(i) {
      return numberOfVotes(i + 1, selectedChoices.value);
    }

    function addVote(i) {
      selectedChoices.value[i] = selectedChoices.value[i]
        ? (selectedChoices.value[i] += 1)
        : 1;
      emit('selectChoice', selectedChoices.value);
    }

    function removeVote(i) {
      selectedChoices.value[i] =
        selectedChoices.value[i] < 1 ? 0 : (selectedChoices.value[i] -= 1);
      emit('selectChoice', selectedChoices.value);
    }

    return { addVote, removeVote, selectedChoices, percentage };
  }
};
</script>
