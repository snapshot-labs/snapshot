<script setup lang="ts">
const { userTheme } = useSkin();
const cardBackgroundUrl = computed(() => {
  return userTheme.value === 'dark'
    ? 'url("/osnap-card-background-dark.svg")'
    : 'url("/osnap-card-background-light.svg")';
});
</script>

<template>
  <div class="border-y border-skin-border text-base md:rounded-xl md:border">
    <div
      class="min-h-[150px] rounded-t-none border-b border-skin-border bg-[length:65%] bg-right-top bg-no-repeat px-4 pb-[12px] pt-3 md:rounded-t-lg"
      :style="{ backgroundImage: cardBackgroundUrl }"
    >
      <img src="/osnap-logo.svg" alt="osnap-logo" class="mb-3" />
      <p class="max-w-[400px]">
        Automatically and securely execute approved Snapshot proposals on-chain.
      </p>
    </div>
    <div
      class="h-[57px] rounded-t-none px-4 pb-[12px] pt-3 md:rounded-t-lg [&_a]:text-skin-heading [&_path]:stroke-skin-heading"
    >
      <BaseLink link="https://uma.xyz/osnap">Add oSnap to Space</BaseLink>
    </div>
  </div>
</template>
