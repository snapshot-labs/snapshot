<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import verified from '@/../snapshot-spaces/spaces/verified.json';
import { useStorage } from '@vueuse/core';

const props = defineProps<{
  spaceKey: string;
}>();

const isModalWarningFlaggedOpen = ref(false);

const acceptedFlaggedSpaces = useStorage<string[]>(
  `snapshot.acceptedFlaggedSpaces`,
  []
);

function addSpaceToAccepted() {
  acceptedFlaggedSpaces.value = [
    ...acceptedFlaggedSpaces.value,
    props.spaceKey
  ];
}

const isFlaggedSpace = computed(() => (verified[props.spaceKey] || 0) === -1);

onMounted(() => {
  if (
    !acceptedFlaggedSpaces.value.includes(props.spaceKey) &&
    isFlaggedSpace.value
  ) {
    isModalWarningFlaggedOpen.value = true;
  }
});
</script>

<template>
  <teleport to="#modal">
    <ModalWarningFlaggedSpace
      :open="isModalWarningFlaggedOpen"
      @close="isModalWarningFlaggedOpen = false"
      @proceed="addSpaceToAccepted"
    />
  </teleport>
</template>
