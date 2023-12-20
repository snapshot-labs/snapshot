<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { ExtendedSpace, BoostStrategy } from '@/helpers/interfaces';
import {
  createBoost,
  getStrategyURI,
  SUPPORTED_NETWORKS,
  SNAPSHOT_GUARD_ADDRESS,
  BOOST_CONTRACTS
} from '@/helpers/boost';
import { ETH_CONTRACT, TWO_WEEKS } from '@/helpers/constants';
import { getProposal } from '@/helpers/snapshot';
import { Token } from '@/helpers/alchemy';
import { sendApprovalTransaction } from '@/helpers/transaction';

defineProps<{
  space: ExtendedSpace;
}>();

type Form = {
  eligibility: {
    choice: 'any' | number;
  };
  distribution: {
    type: 'even' | 'weighted';
    hasRatioLimit: boolean;
    ratioLimit: string;
  };
  network: string;
  token: string;
  amount: string;
};

const route = useRoute();
const router = useRouter();
const auth = getInstance();
const { loadBalances, tokens, loading } = useBalances();
const { web3Account, web3 } = useWeb3();
const { account, updatingAccount, updateAccount } = useAccount();
const {
  createPendingTransaction,
  updatePendingTransaction,
  removePendingTransaction
} = useTxStatus();

const proposal = ref();
const createStatus = ref('');
const customTokens = ref<Token[]>([]);
const openUnsupportedNetworkModal = ref(false);
const form = ref<Form>({
  eligibility: {
    choice: 'any'
  },
  distribution: {
    type: 'weighted',
    hasRatioLimit: false,
    ratioLimit: ''
  },
  network: '11155111',
  token: '',
  amount: '0.1'
});

const allTokens = computed(() => [...tokens.value, ...customTokens.value]);

const isWrongNetwork = computed(() => {
  return form.value.network !== web3.value.network.key.toString();
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
      value: 'any',
      name: 'Anyone who votes'
    },
    ...proposalChoices
  ];
});

const isValidForm = computed(() => {
  if (!form.value.token) return false;
  if (!form.value.amount) return false;
  if (!form.value.eligibility.choice) return false;
  if (
    form.value.distribution.hasRatioLimit &&
    !form.value.distribution.ratioLimit
  )
    return false;
  if (updatingAccount.value) return false;
  return true;
});

const createStatusModalConfig = computed(() => {
  switch (createStatus.value) {
    case 'approve':
      return {
        title: 'Approve spending token',
        subtitle: 'Please approve on your wallet.',
        variant: 'loading' as const
      };
    case 'confirm':
      return {
        title: 'Confirm token deposit',
        subtitle: 'Please confirm deposit on your wallet.',
        variant: 'loading' as const
      };
    case 'success':
      return {
        title: 'Well done! 🥳',
        subtitle: 'Your boost was successfully created.',
        variant: 'success' as const
      };
    case 'error':
      return {
        title: 'Transaction failed',
        subtitle: 'Oops... Your boost creation failed!',
        variant: 'error' as const
      };
    default:
      return undefined;
  }
});

const selectedToken = computed(() => {
  if (!allTokens.value) return undefined;

  const selectedToken = allTokens.value.find(
    (token: Token) => token.contractAddress === form.value.token
  );
  const firstTokenWhichIsNotEth = allTokens.value.find(
    (token: Token) => token.contractAddress !== ETH_CONTRACT
  );

  if (selectedToken) return selectedToken;
  if (firstTokenWhichIsNotEth) {
    form.value.token = firstTokenWhichIsNotEth.contractAddress;
    return firstTokenWhichIsNotEth;
  }
});

const filteredNetworks = computed(() => {
  return Object.values(networks)
    .map((network: any) => {
      return {
        value: network.chainId.toString(),
        name: network.name,
        extras: {
          icon: network.logo
        }
      };
    })
    .filter(network => SUPPORTED_NETWORKS.includes(network.value));
});

const strategy = computed<BoostStrategy>(() => {
  const choice =
    form.value.eligibility.choice === 'any'
      ? undefined
      : form.value.eligibility.choice;

  const limit =
    form.value.distribution.type === 'weighted' &&
    form.value.distribution.ratioLimit
      ? Number(form.value.distribution.ratioLimit)
      : undefined;

  return {
    strategy: 'snapshot',
    params: {
      proposal: proposal.value.id,
      eligibility: {
        choice
      },
      distribution: {
        type: form.value.distribution.type,
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

function handleRetryCreate() {
  createStatus.value = '';
  handleCreate();
}

const amountParsed = computed(
  () =>
    (selectedToken.value &&
      parseUnits(
        form.value.amount || '0',
        selectedToken.value.decimals
      ).toString()) ||
    '0'
);

const requireApproval = computed(() =>
  BigNumber.from(account.value.allowance || '0').lt(
    BigNumber.from(amountParsed.value || '0')
  )
);

function setErrorStatus(error: string) {
  if (error.includes('user rejected transaction')) {
    createStatus.value = '';
  } else {
    createStatus.value = 'error';
  }
}

async function handleApproval() {
  createStatus.value = 'approve';
  try {
    await sendApprovalTransaction(
      auth.web3,
      form.value.token,
      BOOST_CONTRACTS[form.value.network],
      amountParsed.value
    );

    await updateAccount(
      form.value.token,
      form.value.network,
      BOOST_CONTRACTS[form.value.network]
    );
    handleCreate();
  } catch (e: any) {
    console.log('Approval error:', e);
    setErrorStatus(e.message);
  }
}

async function handleCreate() {
  if (!isValidForm.value) return;
  if (isWrongNetwork.value) {
    openUnsupportedNetworkModal.value = true;
    return;
  }
  if (requireApproval.value) {
    handleApproval();
    return;
  }

  const txPendingId = createPendingTransaction();
  createStatus.value = 'confirm';

  try {
    const strategyURI = await getStrategyURI(strategy.value);
    const response = await createBoost(auth.web3, form.value.network, {
      strategyURI,
      token: form.value.token,
      amount: amountParsed.value,
      guard: SNAPSHOT_GUARD_ADDRESS,
      start: proposal.value.start,
      end: proposal.value.end + TWO_WEEKS,
      owner: web3Account.value
    });

    updatePendingTransaction(txPendingId, { hash: response.hash });
    router.push({ name: 'spaceProposal', params: { id: proposal.value.id } });
    createStatus.value = 'success';
  } catch (e: any) {
    setErrorStatus(e.message);
  } finally {
    removePendingTransaction(txPendingId);
  }
}

function resetTokenInput() {
  form.value.token = '';
}

watch(
  [web3Account, () => form.value.network],
  () => {
    resetTokenInput();
    loadBalances(web3Account.value, Number(form.value.network));
  },
  { immediate: true }
);

watchEffect(async () => {
  const id = route.params.proposalId;
  if (id) {
    proposal.value = await getProposal(id);
  }
});

watch(
  () => form.value.distribution.hasRatioLimit,
  () => {
    if (!form.value.distribution.hasRatioLimit) {
      form.value.distribution.ratioLimit = '';
    }
  }
);

watch(
  [web3Account, () => form.value.token, () => form.value.network],
  () => {
    if (!web3Account.value || !form.value.token) return;
    updateAccount(
      form.value.token,
      form.value.network,
      BOOST_CONTRACTS[form.value.network]
    );
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
            <SpaceBoostCardProposal :proposal="proposal" :space="space" />

            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Eligibility"
                  sub-title="Define eligibility criteria effortlessly, establishing clear standards for streamlined decision-making in various opportunities or services."
                />
              </template>

              <TuneListbox
                v-model="form.eligibility.choice"
                :items="eligibilityOptions"
                label="Eligible users"
              />
            </TuneBlock>

            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Deposit amount"
                  sub-title="Customize your deposit: choose a token and amount, tailoring transactions to fit your preferences and goals."
                />
              </template>
              <div class="flex gap-[12px]">
                <ListboxNetwork
                  v-model="form.network"
                  :networks="filteredNetworks"
                />
                <InputComboboxToken
                  v-model:amount="form.amount"
                  label="Amount"
                  :selected-token="selectedToken"
                  :network="form.network"
                  :tokens="tokens"
                  :loading="loading"
                  @update:selected-token="form.token = $event"
                  @add-custom-token="handleAddCustomToken($event)"
                />
              </div>
            </TuneBlock>
            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Distribution based on Voting power"
                  sub-title="Define the maximum amount of voting power, enabling you to set limits and optimize your influence within the voting system."
                />
              </template>
              <TuneSwitch
                v-model="form.distribution.hasRatioLimit"
                label="Define a maximum amount"
              />
              <div v-if="form.distribution.hasRatioLimit" class="mt-3">
                <TuneInput
                  v-model="form.distribution.ratioLimit"
                  label="Max amount of voting power"
                  type="number"
                  placeholder="e.g. 1000"
                >
                  <template #after>
                    <div class="-mr-[8px]">VP</div>
                  </template>
                </TuneInput>
              </div>
            </TuneBlock>
          </div>
        </template>
      </template>

      <template #sidebar-right>
        <div class="border rounded-xl p-3">
          <h4 class="leading-5 mb-1">New boost</h4>
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
    <ModalTransactionStatus
      v-if="createStatusModalConfig"
      open
      :variant="createStatusModalConfig.variant"
      :title="createStatusModalConfig.title"
      :subtitle="createStatusModalConfig.subtitle"
      @close="createStatus = ''"
      @try-again="handleRetryCreate"
    />
    <Teleport to="#modal">
      <ModalUnsupportedNetwork
        :open="openUnsupportedNetworkModal"
        hide-demo-button
        :network="form.network"
        @network-changed="handleCreate"
        @close="openUnsupportedNetworkModal = false"
      />
    </Teleport>
  </div>
</template>
