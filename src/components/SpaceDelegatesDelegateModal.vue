<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { watchDebounced } from '@vueuse/core';
import { validateForm } from '@/helpers/validation';
import { clone, sleep } from '@snapshot-labs/snapshot.js/src/utils';

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
const { setDelegate, loadDelegateBalance, isLoadingDelegateBalance } =
  useDelegates(props.space);
const { formatCompactNumber } = useIntl();
const { web3Account } = useWeb3();

const form = ref({
  to: ''
});
const resolvedAddress = ref('');
const isResolvingName = ref(false);
const addressRef = ref();
const isAwaitingSignature = ref(false);
const accountBalance = ref('');

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

const defaultSpaceDelegates = {
  address: props.address,
  space: props.space,
  weight: 100
};

let spaceDelegates = ref([defaultSpaceDelegates]);

function deleteDelegate(index) {
  spaceDelegates.value.splice(index, 1);
}

function deleteAllDelegates() {
  spaceDelegates.value = [defaultSpaceDelegates];
}

function addDelegate() {
  const newDelegate = {
    address: props.address,
    space: props.space,
    weight: 0
  };

  spaceDelegates.value.push(newDelegate);
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
    const tx = await setDelegate(resolvedAddress.value);
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
  () => {
    form.value.to = props.address;
    resolvedAddress.value = props.address;
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
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
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
        <div class="flex justify-between">
          <TuneLabelInput :hint="definition.properties.to.description">
            {{ definition.properties.to.title }}
          </TuneLabelInput>
          <button
            class="text-gray-500 underline hover:opacity-50 text-xs bg-none"
          >
            Divide equally
          </button>
        </div>
        <div v-for="(delegate, index) in spaceDelegates" :key="index">
          <SpaceDelegateRow
            :address="delegate.address"
            :space="delegate.space"
            :weight="delegate.weight"
            :deleteDelegate="deleteDelegate"
          />
        </div>
        <div class="flex justify-between">
          <TuneButton class="text-skin-link items-center" @click="addDelegate">
            <i-ho-plus class="text-xs mr-2" />
            Add Delegate
          </TuneButton>
          <button
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
        :loading="isResolvingName || isAwaitingSignature"
        class="w-full"
        primary
        @click="handleConfirm"
      >
        {{ $t('confirm') }}
      </TuneButton>
    </template>
  </BaseModal>
</template>
