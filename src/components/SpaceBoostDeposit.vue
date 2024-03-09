<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { Token } from '@/helpers/alchemy';
import { SUPPORTED_NETWORKS } from '@/helpers/boost';
import { BigNumber } from '@ethersproject/bignumber';
import { isExcludedToken } from '@/helpers/boost/tokens';

const props = defineProps<{
  formToken?: Token;
  formNetwork: string;
  formAmount: string;
  tokens: Token[];
  loadingBalances: boolean;
  amountWithTokenFeeParsed: string;
  formErrorMessages: Record<string, string>;
  tokenFeePercent: string;
  tokenFeeParsed: string | BigNumber;
  ethFee: string;
}>();

const emit = defineEmits([
  'update:formNetwork',
  'update:formAmount',
  'update:formToken'
]);

const { formatNumber, getNumberFormatter } = useIntl();

const tokensWithoutExcluded = computed(() => {
  return props.tokens.filter(token => {
    return !isExcludedToken(props.formNetwork, token.contractAddress);
  });
});

const amountWithTokenFeeFormatted = computed(
  () =>
    (props.formToken &&
      formatUnits(props.amountWithTokenFeeParsed, props.formToken.decimals)) ||
    '0'
);

const tokenFeeFormatted = computed(() => {
  return formatNumber(
    Number(
      formatUnits(props.tokenFeeParsed, props.formToken?.decimals ?? '18')
    ),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const filteredNetworks = computed(() => {
  return Object.values(networks)
    .map((network: any) => {
      return {
        value: network.chainId.toString(),
        name: network.name,
        extras: {
          icon: network.logo
        },
        testnet: network.testnet
      };
    })
    .filter(network => SUPPORTED_NETWORKS.includes(network.value));
});

watch(
  tokensWithoutExcluded,
  () => {
    if (!props.formToken && tokensWithoutExcluded.value.length > 0) {
      emit('update:formToken', tokensWithoutExcluded.value[0]);
    }
  },
  { immediate: true }
);
</script>

<template>
  <TuneBlock>
    <template #header>
      <TuneBlockHeader
        title="Deposit amount"
        sub-title="Select a token and specify the total amount for the reward pool."
      />
    </template>
    <div class="flex flex-col md:flex-row gap-[12px]">
      <ListboxNetwork
        :model-value="formNetwork"
        :networks="filteredNetworks"
        @update:model-value="$emit('update:formNetwork', $event)"
      />
      <InputComboboxToken
        :amount="formAmount"
        label="Amount"
        :selected-token="formToken"
        :network="formNetwork"
        :tokens="tokensWithoutExcluded"
        :loading="loadingBalances"
        :error="
          formErrorMessages?.token ||
          formErrorMessages?.amount ||
          formErrorMessages?.balance
        "
        @update:selected-token="$emit('update:formToken', $event)"
        @update:amount="$emit('update:formAmount', $event)"
      />
    </div>
    <TuneBlockFooter v-if="Number(tokenFeePercent) > 0 || Number(ethFee) > 0">
      <div v-if="Number(ethFee) > 0" class="flex justify-between">
        <div class="flex items-center gap-1">
          ETH fee
          <TuneIconHint
            hint="This fee is required for additional gas costs on our end"
          />
        </div>
        <div class="text-skin-heading">
          {{ ethFee }}
          ETH
        </div>
      </div>
      <div v-if="Number(tokenFeePercent) > 0" class="flex justify-between">
        <div class="flex items-center gap-1">
          Token fee
          <TuneIconHint
            hint="This is the fee we charge for the boost service"
          />
        </div>
        <div class="text-skin-heading">
          {{ tokenFeeFormatted }}
          {{ formToken?.symbol }}
          ({{ tokenFeePercent }}%)
        </div>
      </div>
      <div
        class="flex justify-between mt-2 border-t pt-2 border-[--border-color-soft]"
      >
        Final cost
        <div class="text-skin-heading">
          <span v-if="Number(tokenFeePercent) > 0">
            {{ amountWithTokenFeeFormatted }}
            {{ formToken?.symbol }}
          </span>
          <span v-if="Number(ethFee) > 0">
            +

            {{ ethFee }}
            ETH
          </span>
        </div>
      </div>
    </TuneBlockFooter>
  </TuneBlock>
</template>
