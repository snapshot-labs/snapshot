<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { TreasuryWallet } from '@/helpers/interfaces';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);

const treasuryObj = {
  name: '',
  address: '',
  network: ''
};

const modalTreasuryOpen = ref(false);
const currentTreasuryIndex = ref<number | null>(null);
const currentTreasury = ref<TreasuryWallet>(clone(treasuryObj));

function handleRemoveTreasury(i) {
  form.value.treasuries = form.value.treasuries.filter(
    (treasury, index) => index !== i
  );
}

function handleEditTreasury(i) {
  if (props.isViewOnly) return;
  currentTreasuryIndex.value = i;
  currentTreasury.value = clone(form.value.treasuries[i]);
  modalTreasuryOpen.value = true;
}

function handleAddTreasury() {
  currentTreasuryIndex.value = null;
  currentTreasury.value = treasuryObj;
  modalTreasuryOpen.value = true;
}

function handleSubmitTreasury(treasury) {
  if (currentTreasuryIndex.value !== null) {
    const treasuriesClone = clone(form.value.treasuries);
    treasuriesClone[currentTreasuryIndex.value] = treasury;
    form.value.treasuries = treasuriesClone;
  } else {
    form.value.treasuries = form.value.treasuries.concat(treasury);
  }
}
</script>

<template>
  <BaseBlock :title="$t('settings.treasuries.label')">
    <div v-if="form.treasuries.length" class="mb-3 grid gap-3">
      <SettingsTreasuriesBlockItem
        :treasuries="form.treasuries"
        :is-view-only="isViewOnly"
        @edit-treasury="i => handleEditTreasury(i)"
        @remove-treasury="i => handleRemoveTreasury(i)"
      />
    </div>

    <BaseButton
      :disabled="isViewOnly"
      class="block w-full"
      @click="handleAddTreasury"
    >
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
