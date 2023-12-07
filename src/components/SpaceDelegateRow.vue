<script setup lang="ts">
import { PropType } from 'vue';
import { ExtendedSpace } from '@/helpers/interfaces';
import { watchDebounced } from '@vueuse/core';
import { validateForm } from '@/helpers/validation';
import { clone, sleep } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  space: ExtendedSpace;
  address: string;
  weight: number;
  deleteDelegate: (index: number) => void;
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
const localWeight = ref(props.weight);

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

function handleWeightKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' && e.shiftKey) {
    localWeight.value += 10;
  } else if (e.key === 'ArrowDown' && e.shiftKey) {
    localWeight.value -= 10;
  } else if (e.key === 'ArrowUp') {
    localWeight.value++;
  } else if (e.key === 'ArrowDown') {
    localWeight.value--;
  }
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
  web3Account,
  () => {
    loadAccountBalance();
  },
  { immediate: true }
);
</script>

<template>
  <div class="items-end flex space-x-1">
    <div class="min-w-[66.7%] relative">
      <TuneInput
        :placeholder="definition.properties.to.examples[0]"
        :class="{ 'tune-error-border': validationErrors }"
      />
      <!-- <TuneInput
        ref="addressRef"
        v-model="form.to"
        :label="definition.properties.to.title"
        :hint="definition.properties.to.description"
        :placeholder="definition.properties.to.examples[0]"
        :error="validationErrors?.to"
      /> -->
    </div>
    <div class="relative">
      <TuneInput
        v-model="localWeight"
        :class="['text-right pr-5', { 'tune-error-border': validationErrors }]"
        @keydown="e => handleWeightKeydown(e, weight)"
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
  <TuneErrorInput v-if="validationErrors" :error="validationErrors?.to" />
</template>
