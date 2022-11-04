<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import verified from '@/../snapshot-spaces/spaces/verified.json';
import { useStorage } from '@vueuse/core';

const props = defineProps<{
  spaceKey: string;
}>();

const isWarningFlaggedShowing = ref(false);

const acceptedFlaggedSpaces = useStorage<string[]>(
  `snapshot.acceptedFlaggedSpaces`,
  []
);

// function addSpaceToAccepted() {
//   acceptedFlaggedSpaces.value = [
//     ...acceptedFlaggedSpaces.value,
//     props.spaceKey
//   ];
// }

const isFlaggedSpace = computed(() => (verified[props.spaceKey] || 0) === -1);

onMounted(() => {
  if (
    !acceptedFlaggedSpaces.value.includes(props.spaceKey) &&
    isFlaggedSpace.value
  ) {
    isWarningFlaggedShowing.value = true;
  }
});
</script>

<template>
  <BaseContainer v-if="isWarningFlaggedShowing" class="mb-4 px-0 md:px-4">
    <BaseMessageBlock is-responsive level="warning-red">
      {{ $t('warningSpace') }}
      <BaseLink link="https://docs.snapshot.org/spaces/badges-and-warnings">{{
        $t('learnMore')
      }}</BaseLink>
    </BaseMessageBlock>
  </BaseContainer>
</template>
