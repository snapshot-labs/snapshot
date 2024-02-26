<script setup lang="ts">
import { getProposal } from '@/helpers/snapshot';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{ spaceKey: string }>();

const loadingProposal = ref(false);
const proposal = ref<Proposal | null>(null);
const space = ref<ExtendedSpace | null>(null);

const route = useRoute();
const router = useRouter();

const { loadExtendedSpace, extendedSpaces } = useExtendedSpaces();

const proposalId = route.params.id as string;

const isSpaceRelatedProposal = computed(() => {
  if (!space.value || !proposal.value) return false;
  return (
    props.spaceKey === proposal.value.space.id ||
    space.value?.parent?.children
      .map(c => c.id)
      .includes(proposal.value.space.id)
  );
});

async function loadProposal() {
  proposal.value = await getProposal(proposalId);
  if (!proposal.value) return router.push({ name: 'error-404' });

  await loadExtendedSpace(proposal.value.space.id);
  space.value =
    extendedSpaces.value.find(
      space => space.id.toLowerCase() === proposal.value?.space.id.toLowerCase()
    ) ?? null;

  if (!isSpaceRelatedProposal.value) return router.push({ name: 'error-404' });
}

onMounted(async () => {
  loadingProposal.value = true;
  await loadProposal();
  loadingProposal.value = false;
});
</script>

<template>
  <div>
    <LoadingSpinner v-if="loadingProposal" class="overlay big" />

    <SpaceProposalPage
      v-else-if="proposal && space"
      :space="space"
      :proposal="proposal"
      @reload-proposal="loadProposal"
    />
  </div>
</template>
