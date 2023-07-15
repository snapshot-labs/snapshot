<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { MINT_CURRENCY, MINT_NETWORK } from '@/helpers/nftClaimer';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close', 'mint']);

const { getContractInfo, getCollectionInfo } = useNFTClaimerStorage();
const { formatNumber } = useIntl();

const contractInfo = computed(() => {
  return getContractInfo(props.space.id);
});

const collectionInfo = computed(() => {
  return getCollectionInfo(props.space.id, props.proposal.id);
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex justify-center pb-2">
        <h3>View all NFTs</h3>
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div class="flex flex-col" :style="{ minHeight: maxHeight }">
        <div
          class="sticky top-0 flex flex-col gap-y-3 border-b border-t bg-skin-bg p-4 py-3"
        >
          <div class="flex flex-row items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[20px] font-bold leading-none text-skin-link">
                {{ collectionInfo.maxSupply }}
              </span>
              <span class="text-sm leading-tight">Max supply</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[20px] font-bold leading-none text-skin-link">
                {{ formatNumber(collectionInfo.formattedMintPrice) }}
                {{ MINT_CURRENCY }}
              </span>
              <span class="text-sm leading-tight">Mint price</span>
            </div>

            <div class="flex gap-x-3">
              <NFTClaimerOpenseaLink
                :network="MINT_NETWORK"
                :contract-address="contractInfo.address"
              />

              <NFTClaimerEtherscanLink
                :network="MINT_NETWORK"
                :contract-address="contractInfo.address"
              />
            </div>

            <NFTClaimerMintButton
              :contract-info="contractInfo"
              :collection-info="collectionInfo"
              :currency="MINT_CURRENCY"
              @click="$emit('mint')"
            />
          </div>

          <SpaceProposalNFTProgress
            :max-supply="collectionInfo.maxSupply"
            :supply="collectionInfo.mintCount"
            :show-info="false"
          />
        </div>

        <div
          v-if="collectionInfo.mintCount === 0"
          class="flex flex-col items-center justify-center p-4"
        >
          <NFTClaimerLogo class="my-4" size="lg" />
          <span>No NFTs minted yet</span>
        </div>

        <div
          v-for="mint in collectionInfo.mints"
          v-else
          :key="mint.id"
          class="mt-3 flex flex-row items-start justify-between gap-x-4 px-4"
        >
          <SpaceProposalNFTExploreModalItem
            :contract-info="contractInfo"
            :collection-info="collectionInfo"
            :mint="mint"
            :space="space"
            :proposal="proposal"
            :mint-network="MINT_NETWORK"
          />
        </div>
      </div>
    </template>
  </BaseModal>
</template>
