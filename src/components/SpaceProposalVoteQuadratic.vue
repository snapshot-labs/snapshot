<script setup lang="ts">
import { ref, watch } from 'vue';
import { calcPercentageOfSum } from '@snapshot-labs/snapshot.js/src/voting/quadratic';
import { useMediaQuery } from '@vueuse/core';
import { Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  userChoice: Record<string, any> | null;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref(props.userChoice || {});

const isSmallScreen = useMediaQuery('(max-width: 543px)');

function percentage(i) {
  return (
    Math.round(
      calcPercentageOfSum(
        selectedChoices.value[i + 1],
        Object.values(selectedChoices.value)
      ) * 1000
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
watch(
  () => selectedChoices.value,
  currentValue => {
    Object.entries(currentValue).forEach(choice => {
      if (choice[1] === '' || (typeof choice[1] === 'number' && choice[1] <= 0))
        delete selectedChoices.value[choice[0]];
    });
    emit('selectChoice', selectedChoices.value);
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="mb-3">
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <BaseButton
        class="mb-2 flex w-full items-center justify-between overflow-hidden"
        :class="selectedChoices[i + 1] > 0 && '!border-skin-link'"
      >
        <div
          v-tippy="{
            content: choice.length > 20 && isSmallScreen ? choice : null
          }"
          class="truncate pr-3 text-left"
        >
          {{ choice }}
        </div>
        <div class="flex items-center justify-end">
          <button
            :disabled="!selectedChoices[i + 1]"
            class="btn-choice"
            @click="removeVote(i + 1)"
          >
            -
          </button>
          <input
            v-if="!isSmallScreen"
            v-model.number="selectedChoices[i + 1]"
            class="input text-center"
            :class="{ 'btn-choice': isSmallScreen }"
            style="width: 40px; height: 44px"
            placeholder="0"
            type="number"
          />
          <div v-if="isSmallScreen" style="min-width: 56px">
            {{ percentage(i) }}%
          </div>
          <button class="btn-choice" @click="addVote(i + 1)">+</button>
          <div
            v-if="!isSmallScreen"
            style="min-width: 52px; margin-right: -5px"
            class="text-right"
          >
            {{ percentage(i) }}%
          </div>
        </div>
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.btn-choice {
  background-color: transparent;
  color: var(--link-color);
  width: 40px;
  height: 44px;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  border-bottom: none;
  border-top: none;
  &:disabled {
    color: gray;
  }
}
</style>
