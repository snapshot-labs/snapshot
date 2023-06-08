<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { watchDebounced } from '@vueuse/core';
import { validateForm } from '@/helpers/validation';
import { clone, sleep } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  open: boolean;
  space: ExtendedSpace;
  selectedDelegate: string;
}>();

const emit = defineEmits(['close', 'reload']);

const {
  createPendingTransaction,
  updatePendingTransaction,
  removePendingTransaction
} = useTxStatus();
const { notify } = useFlashNotification();
const { t } = useI18n();
const { resolveName } = useResolveName();
const { setDelegate, fetchDelegateBalance } = useDelegates(
  props.space.delegationPortal
);
const { formatCompactNumber } = useIntl();
const { web3Account } = useWeb3();

const form = ref({
  scope: 'space',
  to: ''
});
const resolvedAddress = ref('');
const isResolvingName = ref(false);
const formRef = ref();
const isAwaitingSignature = ref(false);
const accountBalance = ref('');

const definition = computed(() => {
  return {
    type: 'object',
    properties: {
      scope: {
        type: 'string',
        title: 'Delegation scope',
        description:
          'Choose whether you want to delegate globally or within the scope a specific space',
        anyOf: [{ const: 'space', title: `This space (${props.space.id})` }]
      },
      to: {
        type: 'string',
        format: 'address',
        title: 'Delegate to',
        description: 'The address, ENS or Lens of who you want to delegate to',
        examples: ['Enter: Address, ENS or Lens']
      }
    },
    required: ['scope', 'to'],
    additionalProperties: false
  };
});

const validationErrors = computed(() => {
  return validateForm(
    definition.value || {},
    clone({
      scope: form.value.scope,
      to: resolvedAddress.value
    })
  );
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

async function handleConfirm() {
  if (!isValid.value) {
    formRef?.value?.forceShowError();
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
    notify(t('notify.delegationRemoved'));
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
  const balance = await fetchDelegateBalance(web3Account.value);
  accountBalance.value = balance;
}

watchDebounced(
  () => form.value.to,
  async value => {
    resolveToAddress(value);
  },
  { debounce: 300 }
);

watch(
  () => props.selectedDelegate,
  () => {
    form.value.to = props.selectedDelegate;
    resolvedAddress.value = props.selectedDelegate;
  }
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
      <div class="items-center justify-center px-6 pb-3">
        <h3>{{ $t('delegates.delegateModal.title') }}</h3>
        <span>{{ $t('delegates.delegateModal.sub') }}</span>
        {{ formatCompactNumber(Number(accountBalance)) }}
        {{ space.symbol }}
      </div>
    </template>

    <div class="space-y-2 p-4">
      <TuneForm
        ref="formRef"
        v-model="form"
        :definition="definition"
        :error="validationErrors"
      />
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
