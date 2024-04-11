<script setup lang="ts">
import { SNAPSHOT_HELP_LINK } from '@/helpers/constants';
import {
  ExtendedSpace,
  Proposal,
  Results,
  SpaceStrategy
} from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results | null;
  strategies: SpaceStrategy[];
  loaded: boolean;
  isAdmin: boolean;
}>();

const emit = defineEmits(['reload']);

const refreshScores = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_HUB_URL}/api/scores/${props.proposal.id}`
    );

    const result = await response.json();

    if (result.result === true) {
      emit('reload');
    }
  } catch (e) {}
};

const isInvalidScore = computed(
  () =>
    props.proposal?.scores_state === 'invalid' &&
    props.proposal.state === 'closed'
);

const isPendingScore = computed(
  () =>
    props.proposal?.scores_state === 'pending' &&
    props.proposal.state === 'closed'
);

onMounted(() => {
  if (isPendingScore.value) {
    refreshScores();
  }
});
</script>

<template>
  <TuneBlock :loading="!loaded">
    <template #header>
      <TuneBlockHeader
        :title="
          proposal.state === 'closed' ? $t('results') : $t('currentResults')
        "
      />
    </template>
    <template v-if="isPendingScore || isInvalidScore">
      <div v-if="isPendingScore" class="leading-5">
        <p class="flex gap-2 text-skin-link mb-3">
          <LoadingSpinner />
          Finalizing results…
        </p>
        {{ $t('resultsCalculating') }}
      </div>
      <BaseMessage v-else-if="isInvalidScore" level="warning">
        <div>{{ $t('resultsError') }}</div>
      </BaseMessage>
      <BaseLink
        v-if="isAdmin"
        :link="SNAPSHOT_HELP_LINK"
        class="mt-3 block"
        hide-external-icon
      >
        <TuneButton tabindex="-1" class="w-full">
          {{ $t('getHelp') }}
        </TuneButton>
      </BaseLink>
    </template>
    <template v-else>
      <SpaceProposalResultsList
        v-if="results"
        :space="space"
        :proposal="proposal"
        :results="results"
        :strategies="strategies"
      />
      <SpaceProposalResultsShutter
        v-if="proposal.privacy === 'shutter'"
        class="pt-2"
      />
    </template>
  </TuneBlock>
</template>
