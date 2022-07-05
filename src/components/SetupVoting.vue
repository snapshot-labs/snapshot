<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['next', 'back']);

const votingStep = ref(1);
</script>

<template>
  <div>
    <div v-if="votingStep === 1" class="space-y-3">
      <h4>How would you like to setup your voting strategy?</h4>
      <ButtonCard title="Basic token voting" @click="votingStep = 2">
        Just select a network and enter your token contract address and we will
        take care of the rest automatically
      </ButtonCard>
      <ButtonCard title="Lemme get creative" @click="votingStep = 3">
        Select up to 8 strategies with a shit ton of options from simple
        whitelist to multi-chain and weighted voting power
      </ButtonCard>
      <ButtonCard
        title="It's complicated... I need help!"
        @click="votingStep = 4"
      >
        Join our discord and get help from the community. Or fill out a quick
        form where you can tell us all about the voting strategy or token that
        you need.
      </ButtonCard>

      <BaseButton primary class="float-right !mt-4" @click="emit('next')">
        Skip
      </BaseButton>
    </div>
    <div>
      <SetupVotingBasic v-if="votingStep === 2" @next="emit('next')" />
      <SetupVotingStrategy v-if="votingStep === 3" @next="emit('next')" />
      <SetupVotingHelp v-if="votingStep === 4" @next="emit('next')" />
    </div>
    <BaseButton
      class="mt-4"
      @click="votingStep !== 1 ? (votingStep = 1) : emit('back')"
    >
      Back
    </BaseButton>
  </div>
</template>
