<script setup lang="ts">
import { ref } from 'vue';
import { useSpaceForm } from '@/composables';

const emit = defineEmits(['next', 'back']);

const votingStep = ref(1);

const { form, setDefaultStrategy } = useSpaceForm('setup');

function nextStep() {
  emit('next');
  if (!form.value.strategies.length) return setDefaultStrategy();
}
</script>

<template>
  <div>
    <div v-if="votingStep === 1">
      <div class="px-4 md:px-0">
        <h4 class="mb-1">{{ $t('setup.strategy.title') }}</h4>
        <p class="mb-3">
          {{ $t('setup.strategy.subtitle') }}
        </p>
      </div>
      <div class="space-y-3">
        <ButtonCard
          :title="$t('setup.strategy.tokenVoting.title')"
          @click="votingStep = 3"
        >
          {{ $t('setup.strategy.tokenVoting.description') }}
        </ButtonCard>
        <ButtonCard
          :title="$t('setup.strategy.onePersonOneVote.title')"
          @click="votingStep = 2"
        >
          {{ $t('setup.strategy.onePersonOneVote.description') }}
        </ButtonCard>
        <ButtonCard
          :title="$t('setup.strategy.advanced.title')"
          @click="votingStep = 4"
        >
          {{ $t('setup.strategy.advanced.description') }}
        </ButtonCard>
      </div>

      <div class="px-4 md:px-0">
        <SetupButtonNext
          :text="form.strategies.length ? 'Keep current settings' : 'skip'"
          @click="nextStep"
        />
      </div>
    </div>
    <div>
      <SetupStrategyVote v-if="votingStep === 2" @next="emit('next')" />
      <SetupStrategyBasic v-if="votingStep === 3" @next="emit('next')" />
      <SetupStrategyAdvanced v-if="votingStep === 4" @next="emit('next')" />
    </div>
    <div class="px-4 md:px-0">
      <SetupButtonBack
        @click="votingStep !== 1 ? (votingStep = 1) : emit('back')"
      />
    </div>
  </div>
</template>
