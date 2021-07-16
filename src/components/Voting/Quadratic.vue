<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue';
import { percentageOfTotal } from '@/helpers/voting/quadratic';
import { useMediaQuery } from '@/composables/useMediaQuery';

defineProps({
  proposal: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref({});

const { isSmallScreen } = useMediaQuery();

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
}

function removeVote(i) {
  if (selectedChoices.value[i])
    selectedChoices.value[i] =
      selectedChoices.value[i] < 1 ? 0 : (selectedChoices.value[i] -= 1);
}

// Delete choice if empty string or 0
watch(selectedChoices.value, currentValue => {
  Object.entries(currentValue).forEach(choice => {
    if (choice[1] === '' || choice[1] === 0)
      delete selectedChoices.value[choice[0]];
  });
  emit('selectChoice', selectedChoices.value);
});
</script>

<template>
  <div class="mb-3">
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <UiButton
        class="d-block width-full mb-2"
        :class="selectedChoices[i + 1] > 0 && 'button--active'"
      >
        <div
          class="
            col-sm-8 col-7
            float-left
            text-left
            pr-3
            tooltipped tooltipped-multiline
          "
          :class="[
            isSmallScreen
              ? 'tooltipped-ne tooltipped-align-left-2'
              : 'tooltipped-n'
          ]"
          :aria-label="choice"
        >
          <span class="truncated width-full">
            {{ choice }}
          </span>
        </div>
        <div
          class="col-4 d-flex flex-items-center flex-justify-end float-right"
        >
          <button
            v-if="!isSmallScreen"
            :disabled="!selectedChoices[i + 1]"
            class="btn-choice"
            @click="removeVote(i + 1)"
          >
            -
          </button>
          <input
            class="input text-center"
            :class="{ 'btn-choice': isSmallScreen }"
            style="width: 40px; height: 44px"
            placeholder="0"
            type="number"
            v-model.number="selectedChoices[i + 1]"
          />
          <button
            v-if="!isSmallScreen"
            class="btn-choice"
            @click="addVote(i + 1)"
          >
            +
          </button>
          <div style="min-width: 52px; margin-right: -5px" class="text-right">
            {{ percentage(i) }}%
          </div>
        </div>
      </UiButton>

      <PluginAragonGovern :proposal="proposal" />
    </div>
  </div>
</template>

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
