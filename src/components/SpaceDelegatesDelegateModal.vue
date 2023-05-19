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
const { setDelegate } = useDelegates({
  standard: 'compound-governor',
  contract: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  subgraphUrl:
    'https://thegraph.com/hosted-service/subgraph/arr00/uniswap-governance-v2'
});

const form = ref({
  scope: 'space',
  to: ''
});
const resolvedAddress = ref('');
const isResolvingName = ref(false);
const formRef = ref();
const isAwaitingSignature = ref(false);

const definition = computed(() => {
  return {
    type: 'object',
    properties: {
      scope: {
        type: 'string',
        title: 'Delegation scope',
        description:
          'Please select whether you want to delegate your voting power globally or for a specific space',
        anyOf: [{ const: 'space', title: `This space (${props.space.id})` }]
      },
      to: {
        type: 'string',
        format: 'address',
        title: 'Delegate to',
        description:
          'Please enter the address, ENS or Lens of the recipient who will receive your delegated voting power',
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
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
    <template #header>
      <div class="items-center justify-center px-6 pb-3">
        <h3>{{ $t('delegates.delegateModal.title') }}</h3>
        <span>{{ $t('delegates.delegateModal.description') }}</span>
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
    <div class="p-4">
      <BaseButton
        :loading="isResolvingName || isAwaitingSignature"
        class="w-full"
        primary
        @click="handleConfirm"
      >
        {{ $t('set') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
