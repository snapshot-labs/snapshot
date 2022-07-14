<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['next', 'back']);

const votingStep = ref(1);
</script>

<template>
  <div>
    <div v-if="votingStep === 1" class="space-y-3">
      <h4>How would you like to setup your voting strategy?</h4>
      <ButtonCard title="One person one vote" @click="votingStep = 2">
        Manage a whitelist of people who can vote or simply set sybil protection
        rules. Every vote is equal and there is no need for a token
      </ButtonCard>
      <ButtonCard title="Token weighted voting" @click="votingStep = 3">
        Votes are weighted by a token. The token can be an ERC-20 or ERC-721
        (NFT) and you can add sybil protection rules
      </ButtonCard>
      <ButtonCard title="Lemme get creative" @click="votingStep = 4">
        Select up to 8 strategies with a shit ton of options from simple
        whitelist to multi-chain and weighted voting power
      </ButtonCard>
      <ButtonCard
        title="It's complicated... I need help!"
        @click="votingStep = 5"
      >
        Join our discord and get help from the community. Or fill out a quick
        form and get someone to build exactly what you need
      </ButtonCard>

      <BaseButton primary class="float-right !mt-4" @click="emit('next')">
        {{ $t('skip') }}
      </BaseButton>
    </div>
    <div>
      <SetupVotingVote v-if="votingStep === 2" @next="emit('next')" />
      <SetupVotingBasic v-if="votingStep === 3" @next="emit('next')" />
      <SetupVotingStrategy v-if="votingStep === 4" @next="emit('next')" />
      <SetupVotingHelp v-if="votingStep === 5" @next="emit('next')" />
    </div>
    <BaseButton
      class="mt-4"
      @click="votingStep !== 1 ? (votingStep = 1) : emit('back')"
    >
      {{ $t('back') }}
    </BaseButton>
  </div>
</template>
