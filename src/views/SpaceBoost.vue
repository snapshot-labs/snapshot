<script setup lang="ts">
import { ExtendedSpace, TokenlistToken } from '@/helpers/interfaces';
import { getProposal } from '@/helpers/snapshot';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const route = useRoute();

const proposal = ref();
const tokens = ref<TokenlistToken[]>([]);
const boostForm = ref({
  limit: 'unlimited',
  eligibility: 'anyone',
  network: '1',
  tokenAddress: '',
  totalAmount: ''
});

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

async function fetchTokens(): Promise<any[]> {
  try {
    // TODO: How are we going to have lists for other networks?
    const response = await fetch(
      'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
    );
    const data = await response.json();
    return data.tokens;
  } catch {
    return [];
  }
}

const selectedToken = computed(() => {
  if (!tokens.value) return undefined;
  return tokens.value.find(
    (token: TokenlistToken) => token.address === boostForm.value.tokenAddress
  );
});

onMounted(async () => {
  tokens.value = await fetchTokens();
});
</script>

<template>
  <div>
    <SpaceBreadcrumbs :space="space" />
    <TheLayout reverse class="pt-[12px]">
      <template #content-left>
        <LoadingPage v-if="!proposal || !tokens" />
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
