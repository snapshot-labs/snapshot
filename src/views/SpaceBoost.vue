<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { getProposal } from '@/helpers/snapshot';
import { Token } from '@/helpers/alchemy';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const route = useRoute();
const { loadBalances, tokens } = useBalances();
const { web3Account } = useWeb3();

const proposal = ref();
const customTokens = ref<Token[]>([]);
const boostForm = ref({
  limit: 'unlimited',
  eligibility: 'anyone',
  network: '1',
  tokenAddress: '',
  totalAmount: ''
});

const allTokens = computed(() => [...tokens.value, ...customTokens.value]);

const eligibilityOptions = computed(() => {
  const proposalChoices = proposal.value?.choices.map(
    (choice: string, index: number) => {
      return {
        value: index + 1,
        name: `Anyone who votes '${choice}'`
      };
    }
  );

  return [
    {
      value: 'anyone',
      name: 'Anyone who votes'
    },
    ...proposalChoices
  ];
});

watchEffect(async () => {
  const id = route.params.proposalId;
  if (id) {
    proposal.value = await getProposal(id);
  }
});

const selectedToken = computed(() => {
  if (!allTokens.value) return undefined;
  return allTokens.value.find(
    (token: Token) => token.contractAddress === boostForm.value.tokenAddress
  );
});

function handleAddCustomToken(token: Token) {
  if (
    customTokens.value.find(
      existing => existing.contractAddress === token.contractAddress
    )
  ) {
    return;
  }

  customTokens.value.push(token);
}

watch(
  web3Account,
  () => {
    loadBalances(web3Account.value, 1);
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <SpaceBreadcrumbs :space="space" />
    <TheLayout reverse class="pt-[12px]">
      <template #content-left>
        <LoadingPage v-if="!proposal" />
        <template v-else>
          <h1 class="leading-[44px]">New boost</h1>
          <p class="text-md leading-5">
            Incentivize people to vote on this proposal
          </p>

          <BaseBlock title="Eligibility" class="mt-4">
            <!-- Number of eligible users
            <div class="flex gap-4 pt-1">
              <TuneRadio
                v-model="boostForm.limit"
                value="unlimited"
                hint="Unlimited"
              />
              <TuneRadio
                v-model="boostForm.limit"
                value="fixed"
                hint="First x voters only"
              />
            </div> -->

            <TuneListbox
              v-model="boostForm.eligibility"
              :items="eligibilityOptions"
              label="Eligible users"
            />
          </BaseBlock>

          <BaseBlock title="Deposit amount" class="mt-3">
            <div class="flex gap-[12px]">
              <ButtonSelectToken
                :selected-token="selectedToken"
                :network="boostForm.network"
                :tokens="tokens"
                @update:selected-token="boostForm.tokenAddress = $event"
                @add-custom-token="handleAddCustomToken($event)"
              />
              <TuneInput
                v-model="boostForm.totalAmount"
                label="Total amount"
                type="number"
                placeholder="0.00"
              >
                <template #after>
                  <div class="-mr-[8px]">
                    {{ selectedToken?.symbol ?? '' }}
                  </div>
                </template>
              </TuneInput>
            </div>
          </BaseBlock>
          <BaseBlock title="Distribution" class="mt-3"> </BaseBlock>
          <BaseBlock title="Dates" class="mt-3"> </BaseBlock>
        </template>
      </template>

      <template #sidebar-right>
        <div class="border rounded-xl p-4">
          <h4 class="leading-5 mb-1">Create boost</h4>
          <p class="text-md leading-5">
            Boost can’t be changed after publishing, so please be sure.
          </p>
          <TuneButton primary class="w-full mt-4"> Confirm </TuneButton>
        </div>
      </template>
    </TheLayout>
  </div>
</template>
