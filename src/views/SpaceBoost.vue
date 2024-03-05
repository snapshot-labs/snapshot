<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits, formatEther } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { ExtendedSpace } from '@/helpers/interfaces';
import {
  createBoost,
  SUPPORTED_NETWORKS,
  SNAPSHOT_GUARD_ADDRESS,
  BOOST_CONTRACTS,
  BOOST_VERSION,
  getFees
} from '@/helpers/boost';
import { ETH_CONTRACT, TWO_WEEKS, ONE_DAY } from '@/helpers/constants';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getProposal } from '@/helpers/snapshot';
import { Token } from '@/helpers/alchemy';
import { sendApprovalTransaction } from '@/helpers/transaction';
import { pinGraph } from '@/helpers/pin';
import { BoostStrategy } from '@/helpers/boost/types';

const DISTRIBUTION_TYPE_ITEMS = [
  {
    value: 'lottery' as const,
    name: 'Lottery',
    description: 'Randomly selected based on voting power.'
  },
  {
    value: 'weighted' as const,
    name: 'Distributed',
    description: 'Distributed to voters based on voting power.'
  }
];

const props = defineProps<{
  space: ExtendedSpace;
}>();

type Form = {
  eligibility: {
    choice: 'any' | number;
  };
  distribution: {
    type: 'lottery' | 'weighted';
    hasWeightedLimit: boolean;
    weightedLimit: string;
    hasLotteryLimit: boolean;
    lotteryLimit: string;
    numWinners: string;
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
const { env } = useApp();
const { formatNumber, getNumberFormatter } = useIntl();
const { bribeDisabled } = useBoost({ spaceId: props.space.id });

const proposal = ref();
const createStatus = ref('');
const createTx = ref();
const approveTx = ref();
const customTokens = ref<Token[]>([]);
const modalWrongNetworkOpen = ref(false);
const showFormErrors = ref(false);
const ethFee = ref('');
const tokenFeePercent = ref('');
const loadingFees = ref(false);
const form = ref<Form>({
  eligibility: {
    choice: 'any'
  },
  distribution: {
    type: 'lottery',
    hasWeightedLimit: false,
    weightedLimit: '',
    hasLotteryLimit: false,
    lotteryLimit: '',
    numWinners: ''
  },
  network: '11155111',
  token: '',
  amount: ''
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
        name: `Who votes '${choice}'`,
        extras: { disabled: bribeDisabled.value }
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
  return loadingBalances.value || updatingAccount.value || loadingFees.value;
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
        },
        testnet: network.testnet
      };
    })
    .filter(network => SUPPORTED_NETWORKS.includes(network.value));
});

const strategyDistributionLimit = computed(() => {
  if (
    form.value.distribution.type === 'lottery' &&
    form.value.distribution.lotteryLimit
  ) {
    const limitWithTwoDecimals = Number(
      Number(form.value.distribution.lotteryLimit).toFixed(2)
    );

    return ((limitWithTwoDecimals || 0) * 100).toString();
  }
  if (
    form.value.distribution.type === 'weighted' &&
    form.value.distribution.weightedLimit
  ) {
    return parseUnits(
      form.value.distribution.weightedLimit || '0',
      selectedToken.value?.decimals ?? '18'
    ).toString();
  }
  return undefined;
});

const strategy = computed<BoostStrategy>(() => {
  const choice =
    form.value.eligibility.choice === 'any'
      ? undefined
      : form.value.eligibility.choice.toString();

  const eligibilityType =
    form.value.eligibility.choice === 'any' ? 'incentive' : 'bribe';

  return {
    name: 'Boost',
    description: 'Snapshot.org proposal boost',
    image: 'https://snapshot.org/boost.png',
    external_url: `https://snapshot.org/#/${props.space.id}/proposal/${proposal.value.id}`,
    strategyName: 'proposal',
    params: {
      version: BOOST_VERSION,
      env: env === 'demo' ? 'snapshot-testnet' : 'snapshot',
      proposal: proposal.value.id,
      eligibility: {
        type: eligibilityType,
        choice
      },
      distribution: {
        type: form.value.distribution.type,
        limit: strategyDistributionLimit.value,
        numWinners: form.value.distribution.numWinners || undefined
      }
    }
  };
});

const isEndingSoon = computed(() => {
  if (!proposal.value) return false;
  const now = Math.floor(Date.now() / 1000);
  return proposal.value.end - now < ONE_DAY;
});

const amountPerWinner = computed(() => {
  const formattedAmount = formatNumber(
    Number(form.value.amount) / Number(form.value.distribution.numWinners),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );

  return Number(formattedAmount) > 0 ? formattedAmount : 0;
});

const tokenFee = computed(() => {
  const formattedAmount = formatNumber(
    (Number(form.value.amount) / 100) * Number(tokenFeePercent.value),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );

  return Number(formattedAmount) > 0 ? formattedAmount : 0;
});

const formValidation = computed(() => {
  const errors: Record<string, string> = {};

  if (form.value.distribution.hasWeightedLimit) {
    if (!form.value.distribution.weightedLimit) {
      errors.weightedLimit = 'Please enter a number or disable';
    } else if (Number(form.value.distribution.weightedLimit) <= 0) {
      errors.weightedLimit = 'Please enter a value greater than 0 or disable';
    }
  }

  if (form.value.distribution.hasLotteryLimit) {
    if (!form.value.distribution.lotteryLimit) {
      errors.lotteryLimit = 'Please enter a number or disable';
    } else if (Number(form.value.distribution.lotteryLimit) <= 0) {
      errors.lotteryLimit = 'Please enter a value greater than 0 or disable';
    } else if (Number(form.value.distribution.lotteryLimit) >= 100) {
      errors.lotteryLimit = 'Please enter a value less than 100%';
    } else if (Number(form.value.distribution.lotteryLimit) < 0.01) {
      errors.lotteryLimit = 'Please enter a value greater than 0.01%';
    }
  }

  if (!form.value.token) {
    errors.token = 'Please select a token';
  }

  if (!form.value.amount) {
    errors.amount = 'Please enter a value';
  } else if (Number(form.value.amount) <= 0) {
    errors.amount = 'Please enter a value greater than 0';
  }

  if (selectedToken.value) {
    const balance = BigNumber.from(account.value.balance || '0');

    const amount = BigNumber.from(amountWithTokenFeeParsed.value || '0');

    if (balance.lt(amount) && !isLoading.value) {
      errors.balance = 'Insufficient balance';
    }
  }

  if (form.value.distribution.type === 'lottery') {
    if (!form.value.distribution.numWinners) {
      errors.numWinners = 'Please enter a value';
    } else if (Number(form.value.distribution.numWinners) <= 0) {
      errors.numWinners = 'Please enter a value greater than 0';
    } else if (Number(form.value.distribution.numWinners) > 1e7) {
      errors.numWinners = 'Please enter a value less than 10,000,000';
    } else if (!Number.isInteger(Number(form.value.distribution.numWinners))) {
      errors.numWinners = 'Please enter a whole number without any decimals';
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

const amountWithTokenFee = computed(() => {
  const amount = Number(form.value.amount) + Number(tokenFee.value);

  return amount > 0 ? amount : 0;
});

const amountWithTokenFeeParsed = computed(
  () =>
    (selectedToken.value &&
      parseUnits(
        amountWithTokenFee.value.toString() || '0',
        selectedToken.value.decimals
      ).toString()) ||
    '0'
);

const requireApproval = computed(() =>
  BigNumber.from(account.value.allowance || '0').lt(
    BigNumber.from(amountWithTokenFeeParsed.value || '0')
  )
);

function setErrorStatus(error: string) {
  if (error?.includes('user rejected transaction')) {
    createStatus.value = '';
  } else {
    createStatus.value = 'error';
  }
}

async function loadFees() {
  try {
    loadingFees.value = true;
    const provider = getProvider(form.value.network);
    const response = await getFees(provider, form.value.network);
    ethFee.value = formatEther(response.ethFee);
    tokenFeePercent.value = (Number(response.tokenFeePercent) / 100).toString();
  } catch (e: any) {
    console.error('Error loading fees:', e);
  } finally {
    loadingFees.value = false;
  }
}

async function handleApproval() {
  createStatus.value = 'approve';

  try {
    approveTx.value = await sendApprovalTransaction(
      auth.web3,
      form.value.token,
      BOOST_CONTRACTS[form.value.network],
      amountWithTokenFeeParsed.value
    );

    createStatus.value = 'pending';

    await approveTx.value.wait();

    await updateAccount(
      form.value.token,
      form.value.network,
      BOOST_CONTRACTS[form.value.network]
    );
    handleCreate();
  } catch (e: any) {
    console.error('Approval error:', e);
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

    const { cid: ipfsHash } = await pinGraph(strategy.value);
    if (!ipfsHash) throw new Error('Error pinning the strategy');

    createStatus.value = 'confirm';
    createTx.value = await createBoost(
      auth.web3,
      form.value.network,
      ethFee.value,
      {
        strategyURI: `ipfs://${ipfsHash}`,
        token: form.value.token,
        amount: amountWithTokenFeeParsed.value,
        guard: SNAPSHOT_GUARD_ADDRESS,
        start: proposal.value.end,
        end: proposal.value.end + TWO_WEEKS,
        owner: web3Account.value
      }
    );

    createStatus.value = 'pending';

    await createTx.value.wait();
    createStatus.value = 'success';
  } catch (e: any) {
    console.error('Create boost error:', e);
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
    customTokens.value = [];
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
  () => form.value.distribution,
  () => {
    if (!form.value.distribution.hasWeightedLimit) {
      form.value.distribution.weightedLimit = '';
    }
    if (!form.value.distribution.hasLotteryLimit) {
      form.value.distribution.lotteryLimit = '';
    }
    if (form.value.distribution.type === 'lottery') {
      form.value.distribution.hasWeightedLimit = false;
      form.value.distribution.weightedLimit = '';
    }
    if (form.value.distribution.type === 'weighted') {
      form.value.distribution.hasLotteryLimit = false;
      form.value.distribution.lotteryLimit = '';
      form.value.distribution.numWinners = '';
    }
  },
  { deep: true }
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

watch(
  () => form.value.network,
  async () => {
    loadFees();
  },
  { immediate: true }
);
</script>

<template>
  <LoadingSpinner v-if="!proposal" class="overlay big" />

  <div v-else>
    <SpaceBreadcrumbs :space="space" :proposal="proposal" />
    <TheLayout class="pt-[12px] px-[20px] mb-[96px] md:mb-0">
      <template #content-left>
        <h1 class="leading-[44px]">Create a new boost</h1>
        <p class="text-md leading-5">
          Reward voters on this proposal and drive engagement
        </p>

        <div class="space-y-3 mt-[20px] md:mt-4">
          <SpaceBoostCardProposal :proposal="proposal" :space="space" />
          <TuneBlock>
            <template #header>
              <TuneBlockHeader
                title="Deposit amount"
                sub-title="Select a token and specify the total amount for the reward pool."
              />
            </template>
            <div class="flex flex-col md:flex-row gap-[12px]">
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
            <TuneBlockFooter>
              <div v-if="ethFee" class="flex justify-between">
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
              <div class="flex justify-between">
                <div class="flex items-center gap-1">
                  Token fee
                  <TuneIconHint
                    hint="This is the fee we charge for the boost service"
                  />
                </div>
                <div class="text-skin-heading">
                  {{ tokenFee }}
                  {{ selectedToken?.symbol }}
                  ({{ tokenFeePercent }}%)
                </div>
              </div>
              <div
                class="flex justify-between mt-2 border-t pt-2 border-[--border-color-soft]"
              >
                Final cost
                <div class="text-skin-heading">
                  {{ amountWithTokenFee }}
                  {{ selectedToken?.symbol }}

                  +

                  {{ ethFee }}
                  ETH
                </div>
              </div>
            </TuneBlockFooter>
          </TuneBlock>
          <TuneBlock>
            <template #header>
              <TuneBlockHeader
                title="Eligibility"
                sub-title="Choose an option that best incentivises meaningful participation."
              />
            </template>

            <TuneListbox
              v-model="form.eligibility.choice"
              :items="eligibilityOptions"
              label="Eligible to"
            />
            <TuneBlockFooter v-if="bribeDisabled">
              <BaseMessage level="info">
                Selecting a specific choice is disabled for the
                <span class="font-semibold">
                  {{ space.name }}
                </span>
                space
              </BaseMessage>
            </TuneBlockFooter>
          </TuneBlock>

          <TuneBlock>
            <template #header>
              <TuneBlockHeader
                title="Distribution"
                sub-title="Define how the reward pool is distributed to eligible voters."
              />
            </template>
            <div class="space-y-3">
              <div class="flex gap-[12px]">
                <div
                  v-for="item in DISTRIBUTION_TYPE_ITEMS"
                  :key="item.value"
                  class="rounded-xl p-3 cursor-pointer border w-1/2"
                  :class="{
                    'border-skin-link': form.distribution.type === item.value
                  }"
                  @click="form.distribution.type = item.value"
                >
                  <div
                    class="flex justify-between font-semibold text-skin-heading"
                  >
                    {{ item.name }}
                    <i-ho-check v-if="form.distribution.type === item.value" />
                  </div>
                  <div class="leading-[18px] pr-4">
                    {{ item.description }}
                  </div>
                </div>
              </div>
              <template v-if="form.distribution.type === 'weighted'">
                <TuneSwitch
                  v-model="form.distribution.hasWeightedLimit"
                  label="Define a maximum reward per voter"
                />

                <TuneInput
                  v-model="form.distribution.weightedLimit"
                  label="Max reward"
                  type="number"
                  placeholder="100"
                  always-show-error
                  :error="formErrorMessages?.weightedLimit"
                  @click="form.distribution.hasWeightedLimit = true"
                >
                  <template #after>
                    <div class="-mr-[8px]">{{ selectedToken?.symbol }}</div>
                  </template>
                </TuneInput>
              </template>

              <template v-if="form.distribution.type === 'lottery'">
                <TuneInput
                  v-model="form.distribution.numWinners"
                  label="Number of winners"
                  type="number"
                  placeholder="5"
                  always-show-error
                  :error="formErrorMessages?.numWinners"
                >
                  <template #after>
                    <div class="-mr-2">Winners</div>
                  </template>
                </TuneInput>

                <TuneSwitch
                  v-model="form.distribution.hasLotteryLimit"
                  label="Define a maximum chance to win"
                  hint="As the chance to win is based on voting power, setting a limit will ensure a more fair lottery. If set to 1% and the voter has 5% of the voted voting power, the voter will only have a 1% chance to win. If there are not enough voters, the chance to win will be increased to reach a total of 100%."
                />

                <TuneInput
                  v-model="form.distribution.lotteryLimit"
                  label="Max chance to win"
                  type="number"
                  placeholder="1"
                  always-show-error
                  :error="formErrorMessages?.lotteryLimit"
                  @click="form.distribution.hasLotteryLimit = true"
                >
                  <template #after>
                    <div class="-mr-[8px]">%</div>
                  </template>
                </TuneInput>
              </template>
            </div>
            <TuneBlockFooter v-if="form.distribution.type === 'lottery'">
              <div class="flex justify-between">
                Reward per winner
                <div class="text-skin-heading">
                  {{ amountPerWinner }}
                  {{ selectedToken?.symbol }}
                </div>
              </div>
            </TuneBlockFooter>
          </TuneBlock>
        </div>
      </template>

      <template #sidebar-right>
        <TheActionbar break-point="md">
          <div class="md:border rounded-xl p-3 md:mt-3 lg:mt-0">
            <h4 class="leading-5 mb-1 hidden md:block">Create boost</h4>
            <p class="text-md leading-5 hidden md:block">
              Once a boost is created, it can no longer be modified.
            </p>
            <div class="flex justify-left md:mt-3 leading-5">
              <i-ho-exclamation-circle class="inline-block text-sm mr-1" />

              The boost contract is not audited.
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
              class="text-boost flex items-center gap-1 justify-center mt-[6px]"
            >
              <i-ho-clock />
              Proposal
              {{
                getRelativeProposalPeriod(
                  'active',
                  proposal.start,
                  proposal.end
                )
              }}
            </div>
          </div>
        </TheActionbar>
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
