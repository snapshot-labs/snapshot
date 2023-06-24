<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

const emit = defineEmits(['close', 'switchConnectAccount']);

const { mintNetwork, mintCurrency, loading, mint, init, spaceCollectionsInfo } =
  useNFTClaimer(props.space, props.proposal);
const { web3Account } = useWeb3();

const spaceCollectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id];
});

const collectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id].proposals[
    props.proposal.id
  ];
});

const mintCount = ref(1);

function _mint() {
  if (web3Account.value) {
    mint(mintCount.value);
  } else {
    emit('switchConnectAccount');
  }
}

function validateMintCount() {
  if (!mintCount.value || mintCount.value < 1) {
    mintCount.value = 1;
  }

  if (
    mintCount.value >
    spaceCollectionInfo.value.maxSupply - collectionInfo.value.mintCount
  ) {
    mintCount.value =
      spaceCollectionInfo.value.maxSupply - collectionInfo.value.mintCount;
  }
}

watch(
  () => props.open,
  () => {
    init();
  }
);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>{{ $t('Mint NFT') }}</h3>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col justify-between gap-y-4 p-4">
        <BaseBlock :slim="true">
          <div class="p-4">
            <div class="flex flex-row justify-between py-1">
              <span>Contract</span>
              <a
                class="flex flex-row"
                :href="explorerUrl(mintNetwork, spaceCollectionInfo.address)"
                target="_blank"
              >
                <span>{{ shorten(spaceCollectionInfo.address) }}</span>
                <i-ho-arrow-top-right-on-square class="ml-2" />
              </a>
            </div>
            <div class="flex flex-row justify-between py-1">
              <span>Proposal author's share</span>
              <span>{{ spaceCollectionInfo.proposerFee }}%</span>
            </div>
            <div class="flex flex-row justify-between py-1">
              <span>Max supply</span>
              <span>{{ spaceCollectionInfo.maxSupply }}</span>
            </div>
            <div class="flex flex-row justify-between py-1">
              <span>Remaining supply</span>
              <span>{{
                spaceCollectionInfo.maxSupply - collectionInfo.mintCount
              }}</span>
            </div>
            <div class="flex flex-row justify-between py-1">
              <span>Mint price</span>
              <span>
                {{ spaceCollectionInfo.formattedMintPrice }}
                {{ mintCurrency }}
              </span>
            </div>
            <div class="flex flex-row justify-between py-1">
              <span>Mint count</span>
              <span class="w-[72px]">
                <TuneInput
                  v-model="mintCount"
                  min="1"
                  :max="
                    spaceCollectionInfo.maxSupply - collectionInfo.mintCount
                  "
                  type="number"
                  class="text-end"
                  label=""
                  autofocus
                  @blur="validateMintCount()"
                />
              </span>
            </div>
          </div>
          <div class="border-t bg-slate-500/5 p-4 py-2">
            <div class="flex flex-row justify-between py-1">
              <span>Total price</span>
              <div class="flex flex-col">
                <span class="text-md font-bold text-skin-link">
                  {{
                    formatUnits(
                      BigInt(spaceCollectionInfo.mintPrice * mintCount),
                      18
                    )
                  }}
                  {{ mintCurrency }}
                </span>
                <span class="text-end">~xxx USD</span>
              </div>
            </div>
          </div>
        </BaseBlock>
        <NFTClaimerMintButton
          :space-collection-info="spaceCollectionInfo"
          :collection-info="collectionInfo"
          :loading="loading"
          :currency="mintCurrency"
          :show-price="true"
          :count="mintCount"
          @click="_mint()"
        />
      </div>
    </template>
  </BaseModal>
</template>
