<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { ExtendedSpace, BoostStrategy } from '@/helpers/interfaces';
import {
  createBoost,
  SUPPORTED_NETWORKS,
  SNAPSHOT_GUARD_ADDRESS,
  BOOST_CONTRACTS
} from '@/helpers/boost';
import { ETH_CONTRACT, TWO_WEEKS, ONE_DAY } from '@/helpers/constants';
import { getProposal } from '@/helpers/snapshot';
import { Token } from '@/helpers/alchemy';
import { sendApprovalTransaction } from '@/helpers/transaction';
import { pin } from '@snapshot-labs/pineapple';

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
const { loadBalances, tokens, loading: loadingBalances } = useBalances();
const { web3Account, web3 } = useWeb3();
const { account, updatingAccount, updateAccount } = useAccount();
const { modalAccountOpen } = useModal();
const { getRelativeProposalPeriod } = useIntl();

const proposal = ref();
const createStatus = ref('');
const createTx = ref();
const approveTx = ref();
const customTokens = ref<Token[]>([]);
const modalWrongNetworkOpen = ref(false);
const showFormErrors = ref(false);
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
  amount: '0.01'
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

const isLoading = computed(() => {
  return loadingBalances.value || updatingAccount.value;
});

const isValidForm = computed(() => {
  if (Object.keys(formValidation.value).length > 0) return false;
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
    case 'pending':
      return {
        title: 'Transaction pending',
        subtitle: createTx.value?.hash || approveTx.value?.hash || '',
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
        subtitle:
          createTx.value?.hash ||
          approveTx.value?.hash ||
          'Oops... Your boost creation failed!',
        variant: 'error' as const
      };
    case 'pinning':
      return {
        title: 'Pinning boost',
        subtitle: 'Please wait while we pin the boost on IPFS.',
        variant: 'loading' as const
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

  const eligibilityType =
    form.value.eligibility.choice === 'any' ? 'incentive' : 'bribe';

  const limit =
    form.value.distribution.type === 'weighted' &&
    form.value.distribution.ratioLimit
      ? Number(form.value.distribution.ratioLimit)
      : undefined;

  return {
    name: 'proposal',
    params: {
      version: '0.0.1',
      proposal: proposal.value.id,
      eligibility: {
        type: eligibilityType,
        choice
      },
      distribution: {
        type: form.value.distribution.type,
        limit
      }
    }
  };
});

const isEndingSoon = computed(() => {
  if (!proposal.value) return false;
  const now = Math.floor(Date.now() / 1000);
  return proposal.value.end - now < ONE_DAY;
});

const formValidation = computed(() => {
  const errors: Record<string, string> = {};

  if (form.value.distribution.hasRatioLimit) {
    if (!form.value.distribution.ratioLimit) {
      errors.ratioLimit = 'Please enter a value';
    } else if (Number(form.value.distribution.ratioLimit) === 0) {
      errors.ratioLimit = 'Please enter a value greater than 0';
    }
  }

  if (!form.value.token) {
    errors.token = 'Please select a token';
  }

  if (!form.value.amount) {
    errors.amount = 'Please enter a value';
  } else if (Number(form.value.amount) === 0) {
    errors.amount = 'Please enter a value greater than 0';
  }

  if (selectedToken.value) {
    const balance = BigNumber.from(account.value.balance || '0');

    const amount = BigNumber.from(amountParsed.value || '0');

    if (balance.lt(amount)) {
      errors.balance = 'Insufficient balance';
    }
  }

  return errors;
});

const formErrorMessages = computed(() => {
  return showFormErrors.value ? formValidation.value : {};
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

function retryCreation() {
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
  if (error?.includes('user rejected transaction')) {
    createStatus.value = '';
  } else {
    createStatus.value = 'error';
  }
}

async function handleApproval() {
  createStatus.value = 'approve';

  try {
    approveTx.value = await sendApprovalTransaction(
      auth.web3,
      form.value.token,
      BOOST_CONTRACTS[form.value.network],
      amountParsed.value
    );

    createStatus.value = 'pending';

    await approveTx.value.wait(1);

    await updateAccount(
      form.value.token,
      form.value.network,
      BOOST_CONTRACTS[form.value.network]
    );
    handleCreate();
  } catch (e: any) {
    console.log('Approval error:', e);
    setErrorStatus(e.message);
  } finally {
    approveTx.value = undefined;
  }
}

async function handleCreate() {
  if (!web3Account.value) {
    modalAccountOpen.value = true;
    return;
  }
  if (!isValidForm.value) {
    showFormErrors.value = true;
    return;
  }
  if (isWrongNetwork.value) {
    modalWrongNetworkOpen.value = true;
    return;
  }
  if (requireApproval.value) {
    handleApproval();
    return;
  }

  try {
    createStatus.value = 'pinning';
    const { cid: strategyURI } = await pin(strategy.value);
    if (!strategyURI) throw new Error('Error pinning the strategy');

    createStatus.value = 'confirm';
    createTx.value = await createBoost(auth.web3, form.value.network, {
      strategyURI,
      token: form.value.token,
      amount: amountParsed.value,
      guard: SNAPSHOT_GUARD_ADDRESS,
      start: proposal.value.end,
      end: proposal.value.end + TWO_WEEKS,
      owner: web3Account.value
    });

    createStatus.value = 'pending';

    await createTx.value.wait(1);
    createStatus.value = 'success';
  } catch (e: any) {
    console.log('Create boost error:', e);
    setErrorStatus(e.message);
  } finally {
    createTx.value = undefined;
  }
}

function closeStatusModal() {
  if (createStatus.value === 'success')
    router.push({ name: 'spaceProposal', params: { id: proposal.value.id } });
  createStatus.value = '';
}

watch(
  [web3Account, () => form.value.network],
  () => {
    form.value.token = '';
    loadBalances(web3Account.value, form.value.network);
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
          <h1 class="leading-[44px]">Create a new boost</h1>
          <p class="text-md leading-5">
            Reward voters on this proposal and drive engagement
          </p>

          <div class="space-y-3 mt-4">
            <SpaceBoostCardProposal :proposal="proposal" :space="space" />

            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Eligibility"
                  sub-title="Set the criteria for who gets rewarded. Choose an option that best incentivizes meaningful participation."
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
                  sub-title="Select a token and specify the total amount to establish the reward pool for all eligible voters."
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
                  :loading="loadingBalances"
                  :error="
                    formErrorMessages?.token ||
                    formErrorMessages?.amount ||
                    formErrorMessages?.balance
                  "
                  @update:selected-token="form.token = $event"
                  @add-custom-token="handleAddCustomToken($event)"
                />
              </div>
            </TuneBlock>
            <TuneBlock>
              <template #title>
                <TuneBlockHeader
                  title="Distribution based on Voting power"
                  sub-title="Set the maximum reward linked to voting power. Without a limit, the reward will scale indefinitely with the voter's total voting power."
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
                  always-show-error
                  :error="formErrorMessages?.ratioLimit"
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
          <h4 class="leading-5 mb-1">Create boost</h4>
          <p class="text-md leading-5">
            Once a boost is created, it can no longer be modified.
          </p>
          <div class="flex justify-center mt-3 leading-5">
            <i-ho-exclamation-circle class="inline-block text-sm mr-1" />

            This contract is not audited and in beta.
          </div>
          <TuneButton
            :loading="isLoading"
            primary
            class="w-full mt-3"
            @click="handleCreate"
          >
            Create
          </TuneButton>
          <div
            v-if="isEndingSoon"
            class="text-snapshot flex items-center gap-1 justify-center mt-[6px]"
          >
            <i-ho-clock />
            Proposal
            {{
              getRelativeProposalPeriod('active', proposal.start, proposal.end)
            }}
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
      :network="form.network"
      @close="closeStatusModal"
      @try-again="retryCreation"
    />

    <ModalWrongNetwork
      :open="modalWrongNetworkOpen"
      :network="form.network"
      @network-changed="handleCreate"
      @close="modalWrongNetworkOpen = false"
    />
  </div>
</template>
