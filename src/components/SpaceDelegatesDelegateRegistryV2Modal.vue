<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { watchDebounced } from '@vueuse/core';
import { validateForm } from '@/helpers/validation';
import { clone, sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { useRoute } from 'vue-router';
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

const defaultSpaceDelegates = {
  address: props.address,
  space: props.space,
  weight: 100
};

const spaceDelegates = ref([defaultSpaceDelegates]);
const form = ref({
  to: ''
});
const resolvedAddress = ref('');
const isResolvingName = ref(false);
const addressRef = ref();
const isAwaitingSignature = ref(false);
const accountBalance = ref('');
const isSpaceDelegatesValid = computed(() => {
  const allDelegatesHaveAddress = spaceDelegates.value.every(
    delegate => delegate.address
  );

  const totalWeight = spaceDelegates.value.reduce(
    (total, delegate) => total + delegate.weight,
    0
  );

  return !allDelegatesHaveAddress || totalWeight !== 100;
});

const definition = computed(() => {
  return {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        format: 'address',
        title: 'Delegate to',
        description: 'The address, ENS or Lens of who you want to delegate to',
        examples: ['Address, ENS or Lens']
      }
    },
    required: ['to'],
    additionalProperties: false
  };
});

function deleteDelegate(index: number) {
  const delegates = clone(spaceDelegates.value);
  delegates.splice(index, 1);
  spaceDelegates.value = delegates;
}

function updateDelegate(index: number, form: { to: string; weight: number }) {
  const delegates = clone(spaceDelegates.value);
  delegates[index] = {
    ...delegates[index],
    address: form.to,
    weight: form.weight
  };
  spaceDelegates.value = delegates;
}

function deleteAllDelegates() {
  spaceDelegates.value = [defaultSpaceDelegates];
}

function addDelegate() {
  const newDelegate = {
    address: '',
    space: props.space,
    weight: 0
  };

  spaceDelegates.value.push(newDelegate);
}

function divideEqually() {
  const numDelegates = spaceDelegates.value.length;
  if (numDelegates === 0) return;

  const equalWeight = 100 / numDelegates;

  const updatedDelegates = spaceDelegates.value.map(delegate => ({
    ...delegate,
    weight: equalWeight
  }));

  const remainingWeight = 100 - equalWeight * numDelegates;
  updatedDelegates[0].weight += remainingWeight;

  spaceDelegates.value = updatedDelegates;
}

const validationErrors = computed(() => {
  return validateForm(
    definition.value || {},
    clone({
      to: resolvedAddress.value
    })
  );
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

async function handleConfirm() {
  if (!isValid.value) {
    addressRef?.value?.forceShowError();
    return;
  }

  const txPendingId = createPendingTransaction();

  try {
    isAwaitingSignature.value = true;
    const addresses = spaceDelegates.value.map(
      delegation => delegation.address
    );
    const ratio = spaceDelegates.value.map(delegation =>
      Math.round(delegation.weight * 100)
    );

    const tx = await setDelegates(addresses, ratio);
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

async function resolveToAddress(value: string) {
  if (value) {
    isResolvingName.value = true;
    resolvedAddress.value = '';
    resolvedAddress.value = (await resolveName(value)) || '';
    isResolvingName.value = false;
  }
}

async function loadAccountBalance() {
  const balance = await loadDelegateBalance(web3Account.value);
  accountBalance.value = balance || '0';
}

watchDebounced(
  () => form.value.to,
  async value => {
    resolveToAddress(value);
  },
  { debounce: 300 }
);

watch(
  () => props.address,
  newAddress => {
    form.value.to = newAddress;
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
      if (spaceDelegates.value.length === 1) {
        const space = clone(spaceDelegates.value);
        space[0].address = delegateAddress;
        spaceDelegates.value = space;
      }
    }
  },
  { immediate: true }
);

const handleCloseModal = () => {
  spaceDelegates.value = [defaultSpaceDelegates];
  resolvedAddress.value = '';
  isResolvingName.value = false;
  addressRef.value = undefined;
  isAwaitingSignature.value = false;
  accountBalance.value = '';
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
      <div class="space-y-1">
        <div v-if="spaceDelegates.length > 0" class="flex justify-between">
          <TuneLabelInput :hint="definition.properties.to.description">
            {{ definition.properties.to.title }}
          </TuneLabelInput>
          <button
            class="text-gray-500 underline hover:opacity-50 text-xs bg-none"
            @click="divideEqually"
          >
            Divide equally
          </button>
        </div>
        <div
          v-for="(delegate, index) in spaceDelegates"
          :key="`delegate-registry-row-${index}`"
        >
          <SpaceDelegateRegistryV2Row
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
            v-if="spaceDelegates.length > 0"
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
