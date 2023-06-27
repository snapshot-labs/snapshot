<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

const emit = defineEmits(['close', 'switchConnectAccount']);

enum MintStep {
  INFO,
  MINT
}

const { mintNetwork, mintCurrency, loading, mint, init, spaceCollectionsInfo } =
  useNFTClaimer(props.space, props.proposal);
const { web3Account } = useWeb3();
const { formatNumber } = useIntl();
const ethPrice = ref(1900);
const currentStep = ref(MintStep.INFO);
const refreshInfo = ref(false);

const spaceCollectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id];
});

const collectionInfo = computed(() => {
  return spaceCollectionsInfo.value[props.space.id].proposals[
    props.proposal.id
  ];
});

function _mint() {
  if (web3Account.value) {
    currentStep.value = MintStep.MINT;
    refreshInfo.value = true;
    mint();
  } else {
    emit('switchConnectAccount');
  }
}

watch(
  () => props.open,
  () => {
    if (props.open || refreshInfo.value) {
      refreshInfo.value = false;
      init();
    }
    if (!loading.value) {
      currentStep.value = MintStep.INFO;
    }
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
        <template v-if="currentStep === MintStep.INFO">
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
            </div>
            <div class="border-t bg-slate-500/5 p-4 py-2">
              <div class="flex flex-row justify-between py-1">
                <span>Mint price</span>
                <div class="flex flex-col text-end">
                  <span class="text-md font-bold text-skin-link">
                    {{ formatNumber(spaceCollectionInfo.formattedMintPrice) }}
                    {{ mintCurrency }}
                  </span>
                  <span>
                    ~{{
                      formatNumber(
                        ethPrice * spaceCollectionInfo.formattedMintPrice
                      )
                    }}
                    USD
                  </span>
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
            @click="_mint()"
          />
        </template>
        <template v-if="currentStep === MintStep.MINT">
          <SpaceProposalNFTMintModalProgress />
          <div class="flex flex-col justify-between gap-y-2">
            <NFTClaimerMintButton
              :space-collection-info="spaceCollectionInfo"
              :collection-info="collectionInfo"
              :loading="loading"
              :currency="mintCurrency"
              :show-price="true"
              @click="_mint()"
            >
              Mint again
            </NFTClaimerMintButton>
            <BaseButton @click="$emit('close')">Close</BaseButton>
          </div>
        </template>
      </div>
    </template>
  </BaseModal>
</template>
