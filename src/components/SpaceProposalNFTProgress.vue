<script lang="ts" setup>
const props = defineProps({
  supply: { type: Number, required: true },
  maxSupply: { type: Number, required: true },
  showInfo: { type: Boolean, default: true }
});

const mintPercent = computed(() => (props.supply / props.maxSupply) * 100);
</script>

<template>
  <div class="flex w-full flex-col">
    <div v-if="showInfo" class="flex flex-row justify-between pb-1">
      <div>
        <span class="mr-1 text-lg font-bold text-skin-link">
          {{ props.supply }}
        </span>
        <span>/ {{ props.maxSupply }} minted</span>
      </div>
      <i-ho-arrow-top-right-on-square class="ml-2" />
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
