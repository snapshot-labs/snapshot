<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import { useValidationErrors } from '@/composables/useValidationErrors';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useClient } from '@/composables/useClient';
import { useI18n } from '@/composables/useI18n';
import router from '@/router';

const props = defineProps<{
  ensAddress: string;
  web3Account: string;
}>();

const notify = inject<any>('notify');

const visitedFields = ref<string[]>([]);
const modalNetworksOpen = ref(false);

// Space setup form
const form = ref({
  name: '',
  symbol: '',
  network: '',
  // Adds connected wallet as admin so that the settings will show
  // in the sidebar after space creation
  admins: [props.web3Account],
  // Adds "ticket" strategy with VOTE symbol as default/placeholder strategy
  strategies: [
    {
      name: 'ticket',
      params: {
        symbol: 'VOTE'
      }
    }
  ]
});

const { validationErrorMessage } = useValidationErrors();
const { t } = useI18n();

const strategyValidationErrors = computed(
  () => validateSchema(schemas.space, form.value) ?? []
);

function errorIfVisited(field) {
  return visitedFields.value.includes(field)
    ? validationErrorMessage(field, strategyValidationErrors.value)
    : '';
}

const isValid = computed(() => {
  return strategyValidationErrors.value === true;
});

const { send, clientLoading } = useClient();

async function handleSubmit() {
  if (isValid.value) {
    const result = await send({ id: props.ensAddress }, 'settings', form.value);
    console.log('Result', result);
    if (result.id) {
      notify(['green', t('notify.saved')]);
      router.push({
        name: 'spaceProposals',
        params: {
          key: props.ensAddress
        }
      });
    }
  } else {
    console.log('Invalid schema', strategyValidationErrors.value);
  }
}
</script>

<template>
  <div>
    <Block :title="$t('setup.setSpaceProfile')">
      <div class="space-y-2">
        <UiInput
          v-model="form.name"
          :error="errorIfVisited('name')"
          @blur="visitedFields.push('name')"
          focus-on-mount
        >
          <template v-slot:label>{{ $t(`settings.name`) }}*</template>
        </UiInput>
        <UiInput
          v-model="form.symbol"
          placeholder="e.g. BAL"
          :error="errorIfVisited('symbol')"
          @blur="visitedFields.push('symbol')"
        >
          <template v-slot:label> {{ $t(`settings.symbol`) }}* </template>
        </UiInput>
        <UiInput
          @click="modalNetworksOpen = true"
          :error="errorIfVisited('network')"
          @blur="visitedFields.push('network')"
        >
          <template v-slot:selected>
            {{
              form.network ? networks[form.network].name : $t('selectNetwork')
            }}
          </template>
          <template v-slot:label> {{ $t(`settings.network`) }}* </template>
        </UiInput>
        <UiButton
          @click="handleSubmit"
          class="w-full !mt-4"
          primary
          :disabled="!isValid"
          :loading="clientLoading"
        >
          {{ $t('createButton') }}
        </UiButton>
      </div>
    </Block>
  </div>
  <teleport to="#modal">
    <ModalNetworks
      v-model="form.network"
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
    />
  </teleport>
</template>
