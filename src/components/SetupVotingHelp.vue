<script setup lang="ts">
import { ref } from 'vue';
const helpStep = ref(1);
</script>

<template>
  <!-- <SetupMessageHelp class="mb-4" /> -->
  <h4 class="mb-2">Join our discord and checkout the docs</h4>
  <div class="mb-5 space-y-3">
    <div class="flex space-x-3">
      <BaseLink hide-external-icon link="https://discord.gg/snapshot">
        <div
          class="flex w-[170px] cursor-pointer items-center justify-center gap-2 rounded-xl border p-[12px] text-skin-text hover:border-skin-text"
        >
          <IconDiscord class="!text-skin-link" /> Discord
          <i-ho-external-link class="text-sm text-skin-text" />
        </div>
      </BaseLink>
      <BaseLink
        hide-external-icon
        link="https://docs.snapshot.org/spaces/create"
      >
        <div
          class="flex w-[170px] cursor-pointer items-center justify-center gap-2 rounded-xl border p-[12px] text-skin-text hover:border-skin-text"
        >
          <BaseIcon name="gitbook" size="30" class="text-skin-link" /> Docs
          <i-ho-external-link class="text-sm text-skin-text" />
        </div>
      </BaseLink>
    </div>
  </div>

  <h4>Get consulting from an expert</h4>
  <div class="-mt-1 mb-2 text-sm">(Powered by HamsterDAO)</div>
  <div class="space-y-3">
    <ButtonCard title="I need a token" @click="helpStep = 2">
      Fill out a quick form where you can tell us all about the token that you
      need and we will get back to you soon
    </ButtonCard>
    <ButtonCard title="I need a strategy" @click="helpStep = 3">
      Fill out a quick form where you can tell us all about the voting strategy
      that you need and we will get back to you soon
    </ButtonCard>
  </div>
</template>
