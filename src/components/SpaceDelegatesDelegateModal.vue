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

const emit = defineEmits(['close', 'reload']);

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
        examples: ['Enter: Address, ENS or Lens']
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
        <span>{{ $t('delegates.delegateModal.sub') }}</span>
        <LoadingSpinner
          v-if="isLoadingDelegateBalance"
          class="inline-block pl-2"
          small
        />
        <span v-else>
          {{ formatCompactNumber(Number(accountBalance)) }}
          {{ space.symbol }}
        </span>
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

      <TuneInput
        ref="addressRef"
        v-model="form.to"
        :label="definition.properties.to.title"
        :hint="definition.properties.to.description"
        :placeholder="definition.properties.to.examples[0]"
        :error="validationErrors?.to"
      />
    </div>

    <template #footer>
      <BaseButton
        :loading="isResolvingName || isAwaitingSignature"
        class="w-full"
        primary
        @click="handleConfirm"
      >
        {{ $t('confirm') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
