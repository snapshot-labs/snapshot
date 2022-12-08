<script setup lang="ts">
import { onMounted } from 'vue';
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';

import { useQuorum } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  votes: Vote[];
  warning?: string;
}>();

const { totalQuorumScore, totalVotingPower, loadTotalVotingPower } =
  useQuorum(props);

onMounted(() => loadTotalVotingPower());
</script>

<template>
  <ProgressQuorum
    :score="totalQuorumScore"
    :total="totalVotingPower"
    :warning="warning"
  />
</template>
