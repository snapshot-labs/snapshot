<script setup lang="ts">
import { getProposals, MINT_NETWORK } from '@/helpers/nftClaimer';

const props = defineProps<{
  open: boolean;
  nfts: any[];
}>();
defineEmits(['close']);

const loading = ref(true);
const proposals = ref({});

watch(
  () => props.open,
  () => props.open && init()
);

async function init() {
  const proposalIdsMap = Object.fromEntries(
    props.nfts.map(n => [n.proposal.hexId, n.proposal.id])
  );
  const results = await getProposals(Object.keys(proposalIdsMap));

  results.map(result => {
    proposals.value[proposalIdsMap[result.id]] = result;
  });

  loading.value = false;
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>NFTs</h3>
    </template>
    <div class="space-y-3 py-4 md:px-4">
      <LoadingList v-if="loading" />
      <div v-for="mint in nfts" v-else :key="mint">
        <ProfileAboutNFTExploreModalItem
          :mint="mint"
          :proposal="proposals[mint.proposal.id]"
          :network="MINT_NETWORK"
        />
      </div>
    </div>
  </BaseModal>
</template>
