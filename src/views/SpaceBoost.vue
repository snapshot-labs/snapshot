<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { getProposal } from '@/helpers/snapshot';
import { Token } from '@/helpers/alchemy';

const props = defineProps<{
  space: ExtendedSpace;
}>();

type BoostForm = {
  limit: 'unlimited' | 'fixed';
  eligibility: 'anyone' | number;
  network: string;
  tokenAddress: string;
  totalAmount: string;
  distribution: 'fixed' | 'ratio';
};

const route = useRoute();
const { loadBalances, tokens } = useBalances();
const { web3Account } = useWeb3();

const proposal = ref();
const customTokens = ref<Token[]>([]);
const boostForm = ref<BoostForm>({
  limit: 'unlimited',
  eligibility: 'anyone',
  network: '1',
  tokenAddress: '',
  totalAmount: '',
  distribution: 'fixed'
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

const distributionSwitch = computed({
  get() {
    return boostForm.value.distribution === 'ratio';
  },
  set(value: boolean) {
    boostForm.value.distribution = value ? 'ratio' : 'fixed';
  }
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

          <div class="space-y-3 mt-4">
            <TuneBlock>
              <template #title>
                <TuneBlockHeader title="Proposal" />
              </template>
              <RouterLink
                :to="{ name: 'spaceProposal', params: { id: proposal.id } }"
              >
                <TuneBlock>
                  <h4 class="leading-5">
                    {{ proposal.title }}
                  </h4>
                  <p class="line-clamp-2 mt-1">
                    {{ proposal.body }}
                  </p>
                </TuneBlock>
              </RouterLink>
            </TuneBlock>

            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Eligibility"
                  sub-title="Define criteria for eligibility."
                />
              </template>
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
            </TuneBlock>

            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Deposit amount"
                  sub-title="Define custom token and amount to deposit."
                />
              </template>
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
            </TuneBlock>
            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Distribution based on Voting power"
                  sub-title="Define the maximum amount of voting power."
                />
              </template>
              <TuneSwitch
                v-model="distributionSwitch"
                label="Define a maximum amount"
              />
            </TuneBlock>
          </div>
        </template>
      </template>

      <template #sidebar-right>
        <div class="border rounded-xl p-3">
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
