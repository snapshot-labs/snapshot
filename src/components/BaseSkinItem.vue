<script setup lang="ts">
const { skinsSpacesCount } = useSkinsFilter();

const { formatCompactNumber } = useIntl();

defineProps<{
  skin: string;
}>();
</script>

<template>
  <BaseBlock class="cursor-pointer hover:border-skin-text">
    <TuneButton :class="['mb-2', skin]" primary use-white-text>{{
      skin
    }}</TuneButton>
    <div class="text-skin-text">
      {{ $tc('inSpaces', [formatCompactNumber(skinsSpacesCount[skin] ?? 0)]) }}
    </div>
  </BaseBlock>
</template>
