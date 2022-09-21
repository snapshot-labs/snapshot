<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { shortenAddress } from '@/helpers/utils';
import { CollectableAsset } from '@/helpers/safe';
import {
  decodeERC721TransferData,
  encodeERC721TransferData,
  Transaction,
  TransactionOperationType
} from '@/helpers/transactionBuilder';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';

const props = defineProps<{
  showForm: boolean;
  transaction: Transaction | null;
  availableCollectables: CollectableAsset[];
  defaultFromAddress: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saveTransaction', transaction: Transaction): void;
}>();

const selectedCollectableAsset = ref<CollectableAsset | undefined>(undefined);
const recipient = ref<string>('');

const collectablesDropdownOptions = computed(() =>
  props.availableCollectables.map(collectable => ({
    extras: collectable,
    value: collectable
  }))
);

const recipientError = computed<{ message: string } | undefined>(() => {
  if (recipient.value === '') return { message: 'Recipient is required' };
  if (!isAddress(recipient.value))
    return { message: 'Recipient is not a valid address' };
  return undefined;
});

async function populateForm() {
  if (!props.showForm) return;

  selectedCollectableAsset.value = props.availableCollectables[0];

  if (props.transaction) {
    selectedCollectableAsset.value = props.availableCollectables.find(
      asset => asset.tokenAddress === props.transaction!.to // ! => https://github.com/microsoft/TypeScript/issues/36230
    );
    const params = decodeERC721TransferData(props.transaction.data);
    recipient.value = params.recipient;
  }
}

function closeAndClearForm() {
  emit('close');

  selectedCollectableAsset.value = undefined;
  recipient.value = '';
}

function saveTransaction() {
  emit('saveTransaction', {
    to: selectedCollectableAsset.value!.tokenAddress,
    value: BigNumber.from(0),
    data: encodeERC721TransferData(
      props.defaultFromAddress,
      recipient.value,
      selectedCollectableAsset.value!.id
    ),
    operation: TransactionOperationType.CALL
  });

  closeAndClearForm();
}

watch(() => props.showForm, populateForm);
</script>

<template>
  <BaseModal :open="showForm" @close="closeAndClearForm">
    <template #header>
      <h3>Transfer collectable</h3>
    </template>

    <BaseContainer class="py-4">
      <div v-if="availableCollectables.length" class="space-y-2">
        <BaseListbox
          v-model="selectedCollectableAsset"
          :items="collectablesDropdownOptions"
          label="Collectable"
        >
          <template #selected="{ selectedItem }">
            <div class="flex items-center">
              <img
                :src="selectedItem.extras?.imageUri"
                class="mr-2 h-4 w-4"
                :alt="selectedItem.extras?.imageUri"
              />
              <div class="leading-4">
                <div>Token ID: {{ selectedItem.extras?.id }}</div>
                <div class="text-sm opacity-50">
                  Collection: {{ selectedItem.extras?.name }} ({{
                    shortenAddress(selectedItem.extras?.tokenAddress)
                  }})
                </div>
              </div>
            </div>
          </template>

          <template #item="{ item }">
            <div class="flex items-center">
              <img
                :src="item.extras?.imageUri"
                class="mr-2 h-4 w-4"
                :alt="item.extras?.imageUri"
              />
              <div class="leading-4">
                <div>Token ID: {{ item.extras?.id }}</div>
                <div class="text-sm opacity-50">
                  Collection: {{ item.extras?.name }} ({{
                    shortenAddress(item.extras?.tokenAddress)
                  }})
                </div>
              </div>
            </div>
          </template>
        </BaseListbox>
        <div>
          <LabelInput>Recipient</LabelInput>
          <InputString
            v-model="recipient"
            placeholder="0x..."
            :error="recipientError"
          />
        </div>
      </div>
      <div v-else class="py-3 text-center">No collectables found in safe.</div>
    </BaseContainer>

    <template #footer>
      <BaseButton
        class="w-full"
        primary
        :disabled="!!recipientError"
        @click="saveTransaction"
      >
        save
      </BaseButton>
    </template>
  </BaseModal>
</template>
