<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { TreasuryWallet } from '@/helpers/interfaces';
import { useFormValidation } from '@/composables';

const props = defineProps<{
  open: boolean;
  treasury: TreasuryWallet;
}>();

const emit = defineEmits(['add', 'close']);
const { open } = toRefs(props);

const input = ref({
  name: '',
  address: '',
  network: ''
});

const { getValidationMessage } = useFormValidation(
  schemas.space.properties.treasuries.items,
  input
);

const treasuryProperties = computed(
  () => schemas.space.properties.treasuries.items.properties
);

const treasuryValidationErrors = computed(
  () =>
    validateSchema(schemas.space.properties.treasuries.items, input.value) ?? []
);
const isValid = computed(() =>
  treasuryValidationErrors.value === true ? true : false
);

function handleSubmit() {
  const treasuryObj = clone(input.value);
  emit('add', treasuryObj);
  emit('close');
}

watch(open, () => {
  if (props.treasury?.name) {
    input.value = props.treasury;
  } else {
    input.value = {
      name: '',
      address: '',
      network: '1'
    };
  }
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3
        v-text="
          treasury.name
            ? $t('settings.treasuries.edit')
            : $t('settings.treasuries.add')
        "
      />
    </template>
    <div class="m-4">
      <div>
        <div class="space-y-3">
          <ComboboxNetwork
            :network="input.network"
            @select="value => (input.network = value)"
          />
          <BaseInput
            v-model="input.name"
            :title="treasuryProperties.name?.title"
            :placeholder="treasuryProperties?.name.examples[0]"
            :error="{ message: getValidationMessage('name') }"
            focus-on-mount
          />
          <BaseInput
            v-model="input.address"
            :title="treasuryProperties.address?.title"
            :placeholder="treasuryProperties.address?.examples[0]"
            :error="{ message: getValidationMessage('address') }"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton
        :disabled="!isValid"
        class="w-full"
        primary
        @click="handleSubmit"
      >
        {{ $t('save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
