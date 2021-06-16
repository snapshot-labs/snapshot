<template>
  <div class="mb-3">
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <UiButton
        class="d-block width-full mb-2"
        :class="selectedChoices[i + 1] > 0 && 'button--active'"
      >
        <span class="float-left">{{ _shorten(choice, 32) }}</span>
        <div class="d-flex flex-items-center float-right">
          <button
            :disabled="!selectedChoices[i + 1]"
            class="btn-choice"
            @click="removeVote(i + 1)"
          >
            -
          </button>
          <input
            class="input mx-1 text-center"
            style="width: 40px; height: 44px; margin-bottom: -1px"
            placeholder="0"
            type="number"
            v-model.number="selectedChoices[i + 1]"
          />
          <button class="btn-choice" @click="addVote(i + 1)">+</button>
          <div style="min-width: 52px; margin-right: -5px" class="text-right">
            {{ percentage(i) }}%
          </div>
        </div>
      </UiButton>

      <PluginAragonGovern :proposal="proposal" />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
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
      if (selectedChoices.value[i])
        selectedChoices.value[i] =
          selectedChoices.value[i] < 1 ? 0 : (selectedChoices.value[i] -= 1);
      emit('selectChoice', selectedChoices.value);
    }

    // Delete choice if empty string or 0
    watch(selectedChoices.value, (currentValue, oldValue) => {
      Object.entries(currentValue).forEach(choice => {
        if (choice[1] === '' || choice[1] === 0)
          delete selectedChoices.value[choice[0]];
      });
    });

    return { addVote, removeVote, selectedChoices, percentage };
  }
};
</script>

<style lang="scss" scoped>
.btn-choice {
  background-color: transparent;
  color: var(--link-color);
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
  &:disabled {
    color: gray;
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
  }
}
</style>
