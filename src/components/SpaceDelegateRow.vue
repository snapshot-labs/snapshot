<script setup lang="ts">
import { PropType, ref } from 'vue';
import { ExtendedSpace } from '@/helpers/interfaces';
import { watchDebounced } from '@vueuse/core';
import { validateForm } from '@/helpers/validation';
import { clone, sleep } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  space: ExtendedSpace;
  address: string;
  weight: number;
  deleteDelegate: (index: number) => void;
  index: number;
  isError?: boolean;
  spaceDelegates: PropType<
    Array<{ space: ExtendedSpace; address: string; weight: number }>
  >;
}>();

const emit = defineEmits([
  'close',
  'reload',
  'deleteDelegate',
  'update:modelValue'
]);

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
  to: '',
  error: props.isError,
  weight: props.weight ?? 0
});
const resolvedAddress = ref('');
const isResolvingName = ref(false);
const addressRef = ref();
const isAwaitingSignature = ref(false);
const accountBalance = ref('');
// const localWeight = ref(props.weight);
// const displayWeight = ref(localWeight.value);
// const error = ref(props.isError);

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
      },
      weight: {
        type: 'number'
      }
    },
    required: ['to', 'weight'],
    additionalProperties: false
  };
});

const validationErrors = computed(() => {
  return validateForm(
    definition.value || {},
    clone({
      to: form.value.to,
      weight: form.value.weight
    })
  );
});

console.log('validationErrors', validationErrors);
const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

function handleWeightKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' && e.shiftKey) {
    form.value.weight += 10;
  } else if (e.key === 'ArrowDown' && e.shiftKey) {
    form.value.weight -= 10;
  } else if (e.key === 'ArrowUp') {
    form.value.weight++;
  } else if (e.key === 'ArrowDown') {
    form.value.weight--;
  }
  if (e?.target) {
    updateModelValue('', 'weight');
  }
}

function updateModelValue(e: string | number, field: 'to' | 'weight') {
  if (field.includes('to')) {
    form.value.to = e as string;
  }
  if (field.includes('weight')) {
    form.value.weight = e as number;
  }
  // emit('update:modelValue', {
  //   to: form.value.to,
  //   weight: form.value.weight,
  //   isError: false
  // });
}

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
  () => props.weight,
  newWeight => {
    form.value.weight = newWeight;
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
console.log('form', form.value.to);
</script>

<template>
  <div class="items-end flex space-x-1">
    <div class="min-w-[66.7%] relative">
      <TuneInput
        :v-model="form.to"
        :placeholder="definition.properties.to.examples[0]"
        :class="{ 'tune-error-border': error }"
      />
    </div>
    <div class="relative">
      <TuneInput
        :v-model="Math.round(form.weight)"
        type="number"
        :class="['text-right pr-5', { 'tune-error-border': error }]"
        @keydown="e => handleWeightKeydown(e, form.weight.value)"
      />
      <div
        class="text-white absolute w-4 h-4 right-2 top-1/2 transform -translate-y-1/2"
      >
        %
      </div>
    </div>
    <BaseButtonIcon
      class="h-[42px] min-w-[42px] rounded-full border border-skin-border flex items-center justify-center hover:bg-gray-800"
      @click="() => deleteDelegate(index)"
    >
      <i-ho-x class="text-[17px]" />
    </BaseButtonIcon>
  </div>
  <TuneErrorInput v-if="error" :error="validationErrors?.to" />
</template>
