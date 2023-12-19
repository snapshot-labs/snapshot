<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import snapshot from '@snapshot-labs/snapshot.js';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { getUrl, sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace, BoostStrategy } from '@/helpers/interfaces';
import {
  createBoost,
  getStrategyURI,
  BOOST_CONTRACTS,
  SUPPORTED_NETWORKS
} from '@/helpers/boost';
import { SNAPSHOT_GUARD_ADDRESS, ERC20ABI } from '@/helpers/constants';
import { ETH_CONTRACT, TWO_WEEKS } from '@/helpers/constants';
import { getProposal } from '@/helpers/snapshot';
import { Token } from '@/helpers/alchemy';

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
const createStatus = ref('');
const account = ref<{
  balance?: string;
  allowance?: string;
}>({});
const {
  createPendingTransaction,
  updatePendingTransaction,
  removePendingTransaction
} = useTxStatus();

const proposal = ref();
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
  network: '1',
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
  if (firstTokenWhichIsNotEth) return firstTokenWhichIsNotEth;
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
    const approveTx = await sendTransaction(
      auth.web3,
      form.value.token,
      ERC20ABI,
      'approve',
      [BOOST_CONTRACTS[form.value.network], amountParsed.value],
      {}
    );

    const receipt = await approveTx.wait(1);
    console.log('Receipt', receipt);

    await updateAccount();
    handleCreate();
  } catch (e: any) {
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
      balance: amountParsed.value,
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

async function getAccount(account: string, token: string, chainId: string) {
  const multi = new snapshot.utils.Multicaller(
    chainId,
    auth.web3,
    ERC20ABI,
    {}
  );
  multi.call('balance', token, 'balanceOf', [account]);
  multi.call('allowance', token, 'allowance', [
    account,
    BOOST_CONTRACTS[chainId]
  ]);
  return await multi.execute();
}

async function updateAccount() {
  account.value = {};
  if (web3Account.value && form.value.token)
    account.value = await getAccount(
      web3Account.value,
      form.value.token,
      form.value.network
    );
}

watch(
  [web3Account, () => form.value.token, () => form.value.network],
  () => {
    updateAccount();
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
            <TuneBlock class="!bg-[--border-color-faint]">
              <RouterLink
                :to="{ name: 'spaceProposal', params: { id: proposal.id } }"
              >
                <h4 class="leading-5">
                  {{ proposal.title }}
                </h4>
                <p class="line-clamp-2 mt-1 text-skin-text">
                  {{ proposal.body }}
                </p>
              </RouterLink>
              <div class="flex gap-3 items-center h-[20px] mt-[12px]">
                <LinkSpace
                  class="text-skin-text flex items-center"
                  :space-id="proposal.space.id"
                >
                  <AvatarSpace
                    :space="proposal.space"
                    size="20"
                    class="!text-skin-text"
                  />
                  <span
                    class="ml-1 text-skin-text"
                    v-text="proposal.space.name"
                  />
                </LinkSpace>

                <BaseUser
                  :address="proposal.author"
                  :space="space"
                  text-class="text-skin-text"
                />
              </div>
            </TuneBlock>

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
                <TuneListbox
                  v-model="form.network"
                  label="Network"
                  :items="filteredNetworks"
                  class="w-full"
                >
                  <template #item="{ item }">
                    <div class="flex items-center">
                      <BaseAvatar
                        :src="getUrl(item.extras?.icon)"
                        class="mr-2"
                      />
                      <div class="truncate pr-2">
                        {{ item.name }}
                      </div>

                      <BasePill class="leading-4"> #{{ item.value }} </BasePill>
                    </div>
                  </template>
                  <template #selected="{ selectedItem }">
                    <div class="flex items-center">
                      <BaseAvatar
                        :src="getUrl(selectedItem.extras?.icon)"
                        class="mr-2"
                      />
                      <div class="truncate pr-2">
                        {{ selectedItem.name }}
                      </div>
                    </div>
                  </template>
                </TuneListbox>
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
