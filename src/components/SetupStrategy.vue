<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['next', 'back']);

const votingStep = ref(1);
</script>

<template>
  <div>
    <div v-if="votingStep === 1" class="space-y-3">
      <h4>{{ $t('setup.strategy.title') }}</h4>
      <ButtonCard
        :title="$t('setup.strategy.onePersonOneVote.title')"
        @click="votingStep = 2"
      >
        {{ $t('setup.strategy.onePersonOneVote.description') }}
      </ButtonCard>
      <ButtonCard
        :title="$t('setup.strategy.tokenVoting.title')"
        @click="votingStep = 3"
      >
        {{ $t('setup.strategy.tokenVoting.description') }}
      </ButtonCard>
      <ButtonCard
        :title="$t('setup.strategy.advanced.title')"
        @click="votingStep = 4"
      >
        {{ $t('setup.strategy.advanced.description') }}
      </ButtonCard>

      <BaseButton primary class="float-right !mt-4" @click="emit('next')">
        {{ $t('skip') }}
      </BaseButton>
    </div>
    <div>
      <SetupStrategyVote v-if="votingStep === 2" @next="emit('next')" />
      <SetupStrategyBasic v-if="votingStep === 3" @next="emit('next')" />
      <SetupStrategyAdvanced v-if="votingStep === 4" @next="emit('next')" />
    </div>
    <BaseButton
      class="mt-4"
      @click="votingStep !== 1 ? (votingStep = 1) : emit('back')"
    >
      {{ $t('back') }}
    </BaseButton>
  </div>
</template>
