<script setup lang="ts">
import { DelegateTreeItem } from '@/helpers/delegationV2/types';
import { ExtendedSpace } from '@/helpers/interfaces';
import { clone, sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { useRoute } from 'vue-router';
const { d } = useI18n();
const route = useRoute();

const props = defineProps<{
  open: boolean;
  space: ExtendedSpace;
  address: string;
}>();

const emit = defineEmits(['close', 'reload', 'deleteDelegate']);

const {
  createPendingTransaction,
  updatePendingTransaction,
  removePendingTransaction
} = useTxStatus();
const { notify } = useFlashNotification();
const { t } = useI18n();
const { resolveName } = useResolveName();
const { setDelegates, loadDelegateBalance, fetchDelegatingTo } = useDelegates(
  props.space
);
const { web3Account } = useWeb3();

const defaultDelegate = {
  address: '',
  weight: 100
};

const currentDelegations: Ref<{ address: string; weight: number }[]> = ref([]);
const delegates = ref(
  currentDelegations.value.length > 0
    ? clone(currentDelegations.value)
    : [defaultDelegate]
);

const isResolvingName = ref(false);
const addressRef = ref();
const isAwaitingSignature = ref(false);
const accountBalance = ref('');
const expirationDate = ref<number>(calculateInitialDate());
const isSpaceDelegatesValid = computed(() => {
  const allDelegatesHaveAddress = delegates.value.every(
    delegate => delegate.address
  );

  const totalWeight = delegates.value.reduce(
    (total, delegate) => total + delegate.weight,
    0
  );

  return !allDelegatesHaveAddress || totalWeight !== 100;
});

const dateString = computed(() =>
  d(expirationDate.value * 1e3, 'short', 'en-US')
);

const handleExpirationDate = (date: number) => {
  console.log('newDate', d(date * 1e3, 'short', 'en-US'));
  expirationDate.value = date;
};

function calculateInitialDate(): number {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return Math.floor(date.getTime() / 1000);
}

function deleteDelegate(index: number) {
  const newDelegates = clone(delegates.value);
  newDelegates.splice(index, 1);
  delegates.value = newDelegates;
}

function updateDelegate(index: number, form: { to: string; weight: number }) {
  const newDelegates = clone(delegates.value);
  newDelegates[index] = {
    ...newDelegates[index],
    address: form.to,
    weight: form.weight
  };
  delegates.value = newDelegates;
}

function deleteAllDelegates() {
  delegates.value = [defaultDelegate];
}

function addDelegate() {
  const newDelegate = {
    address: '',
    weight: 0
  };

  delegates.value.push(newDelegate);
}

function divideEqually() {
  const numDelegates = delegates.value.length;
  if (numDelegates === 0) return;

  const equalWeight = 100 / numDelegates;

  const updatedDelegates = delegates.value.map(delegate => ({
    ...delegate,
    weight: equalWeight
  }));

  const remainingWeight = 100 - equalWeight * numDelegates;
  updatedDelegates[0].weight += remainingWeight;

  delegates.value = updatedDelegates;
}

const isValid = computed(() => {
  const addresses = delegates.value.map(delegation => delegation.address);

  const weights = delegates.value
    .map(delegation => Math.floor(delegation.weight))
    .filter(weight => weight > 0);

  return (
    addresses.length > 0 &&
    weights.length > 0 &&
    addresses.length === weights.length
  );
});

async function handleConfirm() {
  if (!isValid.value) {
    addressRef?.value?.forceShowError();
    return;
  }

  const txPendingId = createPendingTransaction();

  try {
    isAwaitingSignature.value = true;
    const addresses = delegates.value.map(delegation => delegation.address);

    const weights = delegates.value.map(delegation =>
      Math.floor(delegation.weight)
    );

    const expirationTime = expirationDate.value;

    const tx = await setDelegates(addresses, weights, expirationTime);
    isAwaitingSignature.value = false;
    updatePendingTransaction(txPendingId, { hash: tx.hash });
    emit('close');
    notify(t('notify.transactionSent'));
    const receipt = await tx.wait();
    console.log('Receipt', receipt);
    await sleep(3e3);
    notify(t('notify.delegationAdded'));
    removePendingTransaction(txPendingId);
    emit('reload');
  } catch (e) {
    console.log(e);
    isAwaitingSignature.value = false;
    removePendingTransaction(txPendingId);
  }
}

async function loadAccountBalance() {
  const balance = await loadDelegateBalance(web3Account.value);
  accountBalance.value = balance || '0';
}

async function loadDelegatingTo() {
  const delegatingTo = await fetchDelegatingTo(web3Account.value);
  const delegations = delegatingTo?.delegateTree?.map(
    ({ delegate, weight }) => ({
      address: delegate,
      weight: weight / 100 // delegate weight comes from api as BPS
    })
  );
  currentDelegations.value = clone(delegations) || [];
  console.log('loadDelegatingTo', props.address, delegations);
  if (props.address) {
    const newDelegate = {
      address: props.address,
      weight:
        100 -
        currentDelegations.value.reduce(
          (acc, delegate) => acc + delegate.weight,
          0
        )
    };
    delegations?.push(newDelegate);
  }
  delegates.value = clone(delegations) || [defaultDelegate];
}

watch(
  web3Account,
  () => {
    loadAccountBalance();
    loadDelegatingTo();
  },
  { immediate: true }
);

watch(
  route,
  newDelegateAddress => {
    const delegateAddress = newDelegateAddress.query.delegate;
    if (delegateAddress) {
      console.log('delegateAddress', delegateAddress, clone(delegates.value));
      if (delegates.value.length === 1 && !delegates.value[0].address) {
        console.log('delegate default watch');
        // delegates has default value, replace with the passed address
        const _delegates = clone(delegates.value);
        _delegates[0].address = delegateAddress;
        delegates.value = _delegates;
      } else {
        // if delegates already has a value, add to the end of the list,
        // with the remaining weight of 100
        const newDelegate = {
          address: delegateAddress as string,
          weight:
            100 -
            currentDelegations.value.reduce(
              (acc, delegate) => acc + delegate.weight,
              0
            )
        };
        console.log('delegate watch', newDelegate, clone(delegates.value));
        delegates.value.push(newDelegate);
      }
    }
  },
  { immediate: true }
);

const handleCloseModal = () => {
  console.log('closing modal', currentDelegations.value.length);
  delegates.value =
    currentDelegations.value.length > 0
      ? clone(currentDelegations.value)
      : [defaultDelegate];
  isResolvingName.value = false;
  addressRef.value = undefined;
  isAwaitingSignature.value = false;
  accountBalance.value = '';
  expirationDate.value = calculateInitialDate();
  emit('close');
};
</script>

<template>
  <BaseModal :open="open" @close="handleCloseModal">
    <template #header>
      <div class="px-4 pt-1 text-left text-skin-heading">
        <h3 class="m-0">
          {{ $t('delegates.delegateModal.title') }}
        </h3>

        <span class="text-gray-500">{{
          $t('delegates.delegateModal.sub')
        }}</span>
      </div>
    </template>

    <div class="space-y-3 p-4">
      <div>
        <LabelInput> Delegation scope </LabelInput>
        <div class="mt-1 flex items-center gap-1">
          <AvatarSpace :space="space" />
          <span class="text-skin-heading"> {{ space.name }} </span>
        </div>
      </div>
      <div>
        <TuneLabelInput hint="Your delegations will expire after this date">
          Set expiration
        </TuneLabelInput>
        <InputDate
          :tooltip="$t('create.delayEnforced')"
          :date="expirationDate"
          :date-string="dateString"
          @update:date="handleExpirationDate"
        />
      </div>
      <div class="space-y-1">
        <div v-if="delegates.length > 0" class="flex justify-between">
          <TuneLabelInput
            hint="Add addresses and the percentage of your voting power you want to delegate to them"
          >
            {{ 'Delegate to' }}
          </TuneLabelInput>
          <button
            class="text-gray-500 underline hover:opacity-50 text-xs bg-none"
            @click="divideEqually"
          >
            Divide equally
          </button>
        </div>
        <div
          v-for="(delegate, index) in delegates"
          :key="`delegate-registry-row-${index}`"
        >
          <SpaceSplitDelegationRow
            :address="delegate.address"
            :weight="delegate.weight"
            @delete-delegate="deleteDelegate(index)"
            @update:model-value="form => updateDelegate(index, form)"
          />
        </div>
        <div class="flex justify-between">
          <TuneButton
            class="flex text-skin-link items-center"
            @click="addDelegate"
          >
            <i-ho-plus class="text-xs mr-2" />
            Add Delegate
          </TuneButton>
          <button
            v-if="delegates.length > 0"
            class="text-red underline hover:opacity-50 text-xs bg-none"
            @click="deleteAllDelegates"
          >
            Clear all delegations
          </button>
        </div>
      </div>
    </div>
    <template #footer>
      <TuneButton
        class="w-full"
        type="button"
        :disabled="isSpaceDelegatesValid"
        :loading="isResolvingName || isAwaitingSignature"
        @click="handleConfirm"
      >
        {{ $t('confirm') }}
      </TuneButton>
    </template>
  </BaseModal>
</template>
