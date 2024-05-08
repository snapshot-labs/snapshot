<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { watchDebounced } from '@vueuse/core';
import { validateForm } from '@/helpers/validation';
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
const { setDelegates, loadDelegateBalance } = useDelegates(props.space);
const { web3Account } = useWeb3();

const defaultDelegate = {
  address: props.address,
  weight: 100
};

const delegates = ref([defaultDelegate]);

const resolvedAddress = ref('');
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

watch(
  () => props.address,
  newAddress => {
    resolvedAddress.value = newAddress;
  },
  { immediate: true }
);

watch(
  web3Account,
  () => {
    loadAccountBalance();
  },
  { immediate: true }
);

watch(
  route,
  newDelegateAddress => {
    if (newDelegateAddress) {
      const delegateAddress = newDelegateAddress.query.delegate;
      if (delegates.value.length === 1) {
        const space = clone(delegates.value);
        space[0].address = delegateAddress;
        delegates.value = space;
      }
    }
  },
  { immediate: true }
);

const handleCloseModal = () => {
  delegates.value = [defaultDelegate];
  resolvedAddress.value = '';
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
        <h3 class="m-0">{{ $t('delegates.delegateModal.title') }}</h3>
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
          Set Expiration
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
