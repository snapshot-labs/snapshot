<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { getProposal } from '@/helpers/snapshot';
import { Token } from '@/helpers/alchemy';
import { createBoost, getStrategyURI, BoostStrategy } from '@/helpers/boost';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { SNAPSHOT_GUARD_ADDRESS } from '@/helpers/constants';

const props = defineProps<{
  space: ExtendedSpace;
}>();

type BoostForm = {
  eligibility: {
    choice: 'any' | number;
  };
  distribution: {
    type: 'even' | 'weighted';
    hasRatioLimit: boolean;
    ratioLimit: string | number;
  };
  network: string;
  token: string;
  amount: string | number;
};

const route = useRoute();
const router = useRouter();
const auth = getInstance();
const { loadBalances, tokens } = useBalances();
const { web3Account } = useWeb3();
const {
  createPendingTransaction,
  updatePendingTransaction,
  removePendingTransaction
} = useTxStatus();

const proposal = ref();
const customTokens = ref<Token[]>([]);
const createLoading = ref(false);
const boostForm = ref<BoostForm>({
  eligibility: {
    choice: 'any'
  },
  distribution: {
    type: 'even',
    hasRatioLimit: false,
    ratioLimit: ''
  },
  network: '1',
  token: '',
  amount: ''
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
      value: 'any',
      name: 'Anyone who votes'
    },
    ...proposalChoices
  ];
});

const selectedToken = computed(() => {
  if (!allTokens.value) return undefined;
  return allTokens.value.find(
    (token: Token) => token.contractAddress === boostForm.value.token
  );
});

// const distributionSwitch = computed({
//   get() {
//     return boostForm.value.distribution === 'weighted';
//   },
//   set(value: boolean) {
//     boostForm.value.distribution = value ? 'weighted' : 'even';
//   }
// });

const strategy = computed<BoostStrategy>(() => {
  const choice =
    boostForm.value.eligibility.choice === 'any'
      ? undefined
      : boostForm.value.eligibility.choice;

  const limit =
    boostForm.value.distribution.type === 'weighted'
      ? Number(boostForm.value.distribution.ratioLimit)
      : undefined;

  return {
    strategy: 'snapshot',
    params: {
      proposal: proposal.value.id,
      eligibility: {
        choice
      },
      distribution: {
        type: boostForm.value.distribution.type,
        limit
      }
    }
  };
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

async function handleCreate() {
  createLoading.value = true;
  const txPendingId = createPendingTransaction();

  try {
    const strategyURI = await getStrategyURI(strategy.value);
    const response = await createBoost(auth.web3, {
      strategyURI,
      token: boostForm.value.token,
      balance: Number(boostForm.value.amount),
      guard: SNAPSHOT_GUARD_ADDRESS,
      start: proposal.value.start,
      end: proposal.value.end,
      owner: web3Account.value
    });

    updatePendingTransaction(txPendingId, { hash: response.hash });
    router.push({ name: 'spaceProposal', params: { id: proposal.value.id } });
  } catch (e) {
    console.log(e);
  } finally {
    removePendingTransaction(txPendingId);
  }
}

watch(
  web3Account,
  () => {
    loadBalances(web3Account.value, 1);
  },
  { immediate: true }
);

watchEffect(async () => {
  const id = route.params.proposalId;
  if (id) {
    proposal.value = await getProposal(id);
  }
});
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
                <div class="border rounded-xl p-3">
                  <h4 class="leading-5">
                    {{ proposal.title }}
                  </h4>
                  <p class="line-clamp-2 mt-1">
                    {{ proposal.body }}
                  </p>
                </div>
              </RouterLink>
            </TuneBlock>

            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Eligibility"
                  sub-title="Define criteria for choice."
                />
              </template>

              <TuneListbox
                v-model="boostForm.eligibility.choice"
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
                  @update:selected-token="boostForm.token = $event"
                  @add-custom-token="handleAddCustomToken($event)"
                />
                <TuneInput
                  v-model="boostForm.amount"
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
                v-model="boostForm.distribution.hasRatioLimit"
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
          <TuneButton primary class="w-full mt-4" @click="handleCreate">
            Confirm
          </TuneButton>
          <div class="flex justify-center mt-2">
            <i-ho-information-circle class="inline-block mr-1" />
            This contract is not audited.
          </div>
        </div>
      </template>
    </TheLayout>
  </div>
</template>
