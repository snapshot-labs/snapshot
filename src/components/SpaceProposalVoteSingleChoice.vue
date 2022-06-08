<script setup>
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';

defineProps({
  proposal: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['selectChoice']);

const selectedChoice = ref(null);

function selectChoice(i) {
  selectedChoice.value = i;
  emit('selectChoice', i);
}
</script>

<template>
  <div class="mb-3">
    <BaseButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      @click="selectChoice(i + 1)"
      class="mb-2 block w-full"
      :class="selectedChoice === i + 1 && '!border-skin-link'"
    >
      {{ shorten(choice, 32) }}
    </BaseButton>
  </div>
</template>
