<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { CollectableAsset } from '@/helpers/safe';
import { Transaction } from '@/helpers/transactionBuilder';

const props = defineProps<{
  showForm: boolean;
  transaction: Transaction | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saveTransaction', transaction: Transaction): void;
}>();

const selectedCollectable = ref<CollectableAsset | undefined>(undefined);
const recipient = ref<string>('');

const loadingAvailableCollectables = ref<boolean>(true);
const availableCollectables = ref<CollectableAsset[]>([]);
const getAvailableCollectables = inject(
  'getAvailableCollectables'
) as () => Promise<CollectableAsset[]>;

const defaultFromAddress = inject('defaultFromAddress') as string;

onMounted(async () => {
  availableCollectables.value = await getAvailableCollectables();
  selectedCollectable.value = availableCollectables.value.find(
    collectable =>
      collectable.address === props.transaction.collectableAddress &&
      collectable.id === props.transaction.collectableId
  );
  loadingAvailableCollectables.value = false;
});

const collectableOptions = computed(() =>
  availableCollectables.value.map(collectable => ({
    extras: collectable,
    value: collectable
  }))
);

watch([selectedCollectable, recipient], () => {
  emit('updateTransaction', {
    ...props.transaction,
    from: defaultFromAddress,
    recipient: recipient.value,
    collectableId: selectedCollectable.value?.id || '',
    collectableAddress: selectedCollectable.value?.address || ''
  });
});
</script>

<template>
  <div v-if="loadingAvailableCollectables" class="flex justify-center">
    <LoadingSpinner />
  </div>
  <div v-else-if="availableCollectables.length" class="space-y-2">
    <BaseListbox
      v-model="selectedCollectable"
      :items="collectableOptions"
      label="Collectable"
    >
      <template #selected="{ selectedItem }">
        {{ selectedItem.extras?.name }} ({{ selectedItem.extras?.id }})
      </template>
      <template #item="{ item }">
        <div class="text-sm text-skin-link">{{ item.extras?.address }}</div>
        <div>{{ item.extras?.name }} ({{ item.extras?.id }})</div>
      </template>
    </BaseListbox>
    <div>
      <LabelInput>Recipient</LabelInput>
      <InputString
        v-model="recipient"
        placeholder="0x..."
        :disabled="!selectedCollectable"
      />
    </div>
  </div>
  <div v-else class="py-3 text-center">No collectables found in safe.</div>
</template>
