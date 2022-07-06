<script setup lang="ts">
import { ref } from 'vue';
const helpStep = ref(1);
</script>

<template>
  <SetupMessageHelp v-if="helpStep === 1" class="mb-4" />

  <div class="space-y-3">
    <template v-if="helpStep === 1">
      <h4>Get consulting from an expert</h4>
      <ButtonCard title="I need a token" @click="helpStep = 2">
        Fill out a quick form where you can tell us all about the token that you
        need and we will get back to you soon
      </ButtonCard>
      <ButtonCard title="I need a strategy" @click="helpStep = 3">
        Fill out a quick form where you can tell us all about the voting
        strategy that you need and we will get back to you soon
      </ButtonCard>
    </template>
    <SetupVotingHelpFormToken v-if="helpStep === 2" />
    <SetupVotingHelpFormStrategy v-if="helpStep === 3" />
  </div>
</template>
