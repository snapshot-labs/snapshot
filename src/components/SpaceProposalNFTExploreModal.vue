<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close', 'mint']);

const { mintCurrency, mintNetwork } = useNFTClaimer(
  props.space,
  props.proposal
);
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
                {{ mintCurrency }}
              </span>
              <span class="text-sm leading-tight">Mint price</span>
            </div>

            <NFTClaimerOpenseaLink
              :network="mintNetwork"
              :contract-address="contractInfo.address"
            />

            <NFTClaimerEtherscanLink
              :network="mintNetwork"
              :contract-address="contractInfo.address"
            />

            <NFTClaimerMintButton
              :contract-info="contractInfo"
              :collection-info="collectionInfo"
              :currency="mintCurrency"
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
          v-for="mint in collectionInfo.mints"
          :key="mint.id"
          class="mt-3 flex flex-row items-start justify-between gap-x-4 px-4"
        >
          <SpaceProposalNFTExploreModalItem
            :contract-info="contractInfo"
            :collection-info="collectionInfo"
            :mint="mint"
            :space="space"
            :proposal="proposal"
            :mint-network="mintNetwork"
          />
        </div>

        <div
          v-if="collectionInfo.mintCount === 0"
          class="flex flex-col items-center justify-center p-4"
        >
          <NFTClaimerLogo class="my-4" size="lg" />
          <span>No NFTs minted yet</span>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
