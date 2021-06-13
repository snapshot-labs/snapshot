<template>
  <div class="mb-3">
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <UiButton
        class="d-block width-full mb-2"
        :class="selectedChoices[i + 1] > 0 && 'button--active'"
      >
        <span class="float-left">{{ _shorten(choice, 32) }}</span>
        <div class="d-flex flex-items-center float-right">
          <a class="btn-choice" @click="removeVote(i + 1)"> - </a>
          <div style="min-width: 35px">{{ selectedChoices[i + 1] || 0 }}</div>
          <a class="btn-choice" @click="addVote(i + 1)">+</a>
          <div style="min-width: 50px; margin-right: -5px" class="text-right">
            {{ percentage(i) }}%
          </div>
        </div>
      </UiButton>

      <PluginAragonGovern :proposal="proposal" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { percentageOfTotal } from '@/helpers/voting/quadratic';
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
      return (
        Math.round(
          percentageOfTotal(
            i + 1,
            selectedChoices.value,
            Object.values(selectedChoices.value)
          ) * 10
        ) / 10
      );
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

<style lang="scss" scoped>
.btn-choice {
  margin-bottom: 2px;
  width: 40px;
  height: 44px;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  border-bottom: none;
  border-top: none;
  &:hover {
    border-left: 1px solid var(--link-color);
    border-right: 1px solid var(--link-color);
  }
}
</style>
