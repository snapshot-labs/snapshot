<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { MINT_NETWORK, MINT_CURRENCY } from '@/helpers/nftClaimer';

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

const { loading, mint, errored } = useNFTClaimer(props.space, props.proposal);
const { getContractInfo, getCollectionInfo, refresh } = useNFTClaimerStorage();
const { web3Account } = useWeb3();
const { formatNumber } = useIntl();

// TODO implement eth-fiat live conversion
const ethPrice = ref(1900);
const currentStep = ref(MintStep.INFO);
const refreshInfo = ref(false);

const contractInfo = computed(() => {
  return getContractInfo(props.space.id);
});

const collectionInfo = computed(() => {
  return getCollectionInfo(props.space.id, props.proposal.id);
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
      refresh(props.proposal);
    }
    if (!loading.value) {
      currentStep.value = MintStep.INFO;
    }
  }
);
</script>

<template>
  <BaseModal max-height="550px" :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('Mint NFT') }}</h3>
    </template>
    <template #default>
      <div class="flex flex-col justify-between gap-y-4 p-4">
        <template v-if="currentStep === MintStep.INFO">
          <BaseBlock :slim="true">
            <div class="p-4">
              <div class="flex flex-row justify-between py-1">
                <span>Contract</span>
                <NFTClaimerEtherscanLink
                  :network="MINT_NETWORK"
                  :contract-address="contractInfo.address"
                  as-link
                />
              </div>
              <div class="flex flex-row justify-between py-1">
                <span>OpenSea collection</span>

                <NFTClaimerOpenseaLink
                  :network="MINT_NETWORK"
                  :contract-address="contractInfo.address"
                />
              </div>
              <div class="flex flex-row justify-between py-1">
                <span>Proposal author's share</span>
                <span>{{ collectionInfo.proposerFee }}%</span>
              </div>
              <div class="flex flex-row justify-between py-1">
                <span>Max supply</span>
                <span>{{ collectionInfo.maxSupply }}</span>
              </div>
              <div class="flex flex-row justify-between py-1">
                <span>Remaining supply</span>
                <span>{{
                  collectionInfo.maxSupply - collectionInfo.mintCount
                }}</span>
              </div>
            </div>
            <div class="border-t bg-slate-500/5 p-4 py-2">
              <div class="flex flex-row justify-between py-1">
                <span>Mint price</span>
                <div class="flex flex-col text-end">
                  <span class="text-md font-bold text-skin-link">
                    {{ formatNumber(collectionInfo.formattedMintPrice) }}
                    {{ MINT_CURRENCY }}
                  </span>
                  <span>
                    ~{{
                      formatNumber(ethPrice * collectionInfo.formattedMintPrice)
                    }}
                    USD
                  </span>
                </div>
              </div>
            </div>
          </BaseBlock>
          <NFTClaimerMintButton
            :contract-info="contractInfo"
            :collection-info="collectionInfo"
            :loading="loading"
            :currency="MINT_CURRENCY"
            :show-price="true"
            @click="_mint()"
          />
        </template>
        <template v-if="currentStep === MintStep.MINT">
          <SpaceProposalNFTMintModalProgress />
          <div class="flex flex-col justify-between gap-y-3">
            <NFTClaimerMintButton
              v-if="errored"
              :contract-info="contractInfo"
              :collection-info="collectionInfo"
              :loading="loading"
              :currency="MINT_CURRENCY"
              :show-price="true"
              @click="_mint()"
            >
              Try again
            </NFTClaimerMintButton>
            <BaseButton @click="$emit('close')">Close</BaseButton>
          </div>
        </template>
      </div>
    </template>
  </BaseModal>
</template>
