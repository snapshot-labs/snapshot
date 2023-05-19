<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { watchDebounced } from '@vueuse/core';
import { validateForm } from '@/helpers/validation';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  open: boolean;
  space: ExtendedSpace;
  selectedDelegate: string;
}>();

const emit = defineEmits(['close']);

const { resolveName } = useResolveName();

const form = ref({
  scope: 'space',
  to: ''
});
const resolvedAddress = ref('');
const isResolvingName = ref(false);
const formRef = ref();

const def = computed(() => {
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
    def.value || {},
    clone({
      scope: form.value.scope,
      to: resolvedAddress.value
    })
  );
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

function handleConfirm() {
  if (!isValid.value) {
    formRef?.value?.forceShowError();
    return;
  }

  emit('close');
}

async function resolveTo(value: string) {
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
    resolveTo(value);
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
        :definition="def"
        :error="validationErrors"
      />
    </div>
    <div class="p-4">
      <BaseButton
        :loading="isResolvingName"
        class="w-full"
        primary
        @click="handleConfirm"
      >
        {{ $t('confirm') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
