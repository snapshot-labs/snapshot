<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const votingStep = ref(1);

function nextStep() {
  router.push({ query: { step: '6' } });
}
</script>

<template>
  <div>
    <div v-if="votingStep === 1" class="space-y-3">
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
        Have a Hamster DAO contributor guide you through the process and answer
        any questions you have
      </ButtonCard>

      <BaseButton primary class="float-right" @click="nextStep">
        Skip
      </BaseButton>
    </div>
    <div>
      <SetupVotingBasic v-if="votingStep === 2" @next="nextStep" />
      <SetupVotingStrategy v-if="votingStep === 3" @next="nextStep" />
    </div>
    <BaseButton v-if="votingStep !== 1" class="mt-4" @click="votingStep = 1">
      Back
    </BaseButton>
  </div>
</template>
