<script setup lang="ts">
import { getProposals } from '@/helpers/nftClaimer';
import { BigNumber } from '@ethersproject/bignumber';

const props = defineProps<{
  open: boolean;
  nfts: any[];
}>();

const inited = ref(false);
const proposals = ref({});

watch(
  () => props.open,
  () => props.open && init()
);

async function init() {
  const ids = props.nfts.map(n => BigNumber.from(n.proposal.id).toHexString());
  const results = await getProposals(ids);

  results.map(result => {
    proposals.value[BigNumber.from(result.id).toString()] = result;
  });

  inited.value = true;
}

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>NFTs</h3>
    </template>
    <div v-if="inited" class="space-y-3 py-4 md:px-4">
      <div v-for="mint in nfts" :key="mint">
        <ProfileAboutNFTExploreModalItem
          :mint="mint"
          :proposal="proposals[mint.proposal.id]"
        />
      </div>
    </div>
  </BaseModal>
</template>
