<script lang="ts" setup>
const props = defineProps<{
  supply: number;
  maxSupply: number;
  showInfo?: boolean;
}>();

const mintPercent = computed(() =>
  Math.min((props.supply / props.maxSupply) * 100, 100)
);
</script>

<template>
  <div class="flex w-full flex-col">
    <div v-if="showInfo" class="flex flex-row justify-between pb-1">
      <div>
        <span class="mr-1 text-lg font-bold text-skin-link">
          {{ supply }}
        </span>
        <span>/ {{ maxSupply }} minted</span>
      </div>
      <slot name="secondary" />
    </div>

    <div
      class="relative flex h-2 w-full flex-row overflow-hidden rounded bg-skin-border"
    >
      <div
        class="z-5 absolute flex h-full flex-row rounded bg-primary"
        :style="{ width: mintPercent + '%' }"
      ></div>
    </div>
  </div>
</template>
