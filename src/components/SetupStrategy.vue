<script setup lang="ts">
import { ref } from 'vue';
import { useSpaceForm } from '@/composables';

const emit = defineEmits(['next', 'back']);

enum Step {
  CHOOSE,
  TOKEN_VOTING,
  ONE_PERSON_ONE_VOTE,
  ADVANCED
}

const votingStep = ref(Step.CHOOSE);

const { form, setDefaultStrategy } = useSpaceForm('setup');

function nextStep() {
  emit('next');
  if (!form.value.strategies.length) return setDefaultStrategy();
}
</script>

<template>
  <div>
    <div v-if="votingStep === Step.CHOOSE">
      <div class="px-4 md:px-0">
        <h4 class="mb-1">{{ $t('setup.strategy.title') }}</h4>
        <p class="mb-3">
          {{ $t('setup.strategy.subtitle') }}
        </p>
      </div>
      <div class="space-y-3">
        <ButtonCard
          :title="$t('setup.strategy.tokenVoting.title')"
          @click="votingStep = Step.TOKEN_VOTING"
        >
          {{ $t('setup.strategy.tokenVoting.description') }}
        </ButtonCard>
        <ButtonCard
          :title="$t('setup.strategy.onePersonOneVote.title')"
          @click="votingStep = Step.ONE_PERSON_ONE_VOTE"
        >
          {{ $t('setup.strategy.onePersonOneVote.description') }}
        </ButtonCard>
        <ButtonCard
          :title="$t('setup.strategy.advanced.title')"
          @click="votingStep = Step.ADVANCED"
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
    <SetupStrategyVote
      v-else-if="votingStep === Step.ONE_PERSON_ONE_VOTE"
      @next="emit('next')"
    />
    <SetupStrategyBasic
      v-else-if="votingStep === Step.TOKEN_VOTING"
      @next="emit('next')"
    />
    <SetupStrategyAdvanced
      v-else-if="votingStep === Step.ADVANCED"
      @next="emit('next')"
    />
    <div class="px-4 md:px-0">
      <SetupButtonBack
        @click="
          votingStep !== Step.CHOOSE ? (votingStep = Step.CHOOSE) : emit('back')
        "
      />
    </div>
  </div>
</template>
