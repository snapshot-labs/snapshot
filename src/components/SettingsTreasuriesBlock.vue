<script setup lang="ts">
import { ref } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { TreasuryWallet } from '@/helpers/interfaces';

const props = defineProps<{
  treasuries: TreasuryWallet[];
}>();

const emit = defineEmits(['updateTreasuries']);

const treasuryObj = {
  name: '',
  address: '',
  network: ''
};

const modalTreasuryOpen = ref(false);
const currentTreasuryIndex = ref<number | null>(null);
const currentTreasury = ref<TreasuryWallet>(clone(treasuryObj));

function handleRemoveTreasury(i) {
  emit(
    'updateTreasuries',
    props.treasuries.filter((treasury, index) => index !== i)
  );
}

function handleEditTreasury(i) {
  currentTreasuryIndex.value = i;
  currentTreasury.value = clone(props.treasuries[i]);
  modalTreasuryOpen.value = true;
}

function handleAddTreasury() {
  currentTreasuryIndex.value = null;
  currentTreasury.value = treasuryObj;
  modalTreasuryOpen.value = true;
}

function handleSubmitTreasury(treasury) {
  if (currentTreasuryIndex.value !== null) {
    const treasuriesClone = clone(props.treasuries);
    treasuriesClone[currentTreasuryIndex.value] = treasury;
    emit('updateTreasuries', treasuriesClone);
  } else {
    emit('updateTreasuries', props.treasuries.concat(treasury));
  }
}
</script>

<template>
  <BaseBlock :title="$t('settings.treasuries.label')">
    <div v-if="treasuries.length" class="mb-3 grid gap-3">
      <SettingsTreasuriesBlockItem
        :treasuries="treasuries"
        @edit-treasury="i => handleEditTreasury(i)"
        @remove-treasury="i => handleRemoveTreasury(i)"
      />
    </div>

    <BaseButton class="block w-full" @click="handleAddTreasury">
      {{ $t('settings.treasuries.add') }}
    </BaseButton>
    <teleport to="#modal">
      <ModalTreasury
        :open="modalTreasuryOpen"
        :treasury="currentTreasury"
        @close="modalTreasuryOpen = false"
        @add="handleSubmitTreasury"
      />
    </teleport>
  </BaseBlock>
</template>
