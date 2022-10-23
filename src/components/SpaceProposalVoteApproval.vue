<script setup lang="ts">
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  userChoice: number[] | null;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref<number[]>(props.userChoice || []);

function selectChoice(i: number) {
  if (selectedChoices.value.includes(i))
    selectedChoices.value.splice(selectedChoices.value.indexOf(i), 1);
  else selectedChoices.value.push(i);

  emit('selectChoice', selectedChoices.value);
}
</script>

<template>
  <div class="mb-3">
    <BaseButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      class="relative mb-2 block w-full"
      :class="{
        '!border-skin-link': selectedChoices.includes(i + 1),
        'border-skin-border hover:border-skin-link': !selectedChoices.includes(
          i + 1
        )
      }"
      @click="selectChoice(i + 1)"
    >
      <i-ho-check v-if="selectedChoices.includes(i + 1)" class="absolute" />
      {{ shorten(choice, 32) }}
    </BaseButton>
  </div>
</template>
