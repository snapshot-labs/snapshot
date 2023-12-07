<script setup lang="ts">
import { ExtendedSpace, TreasuryWallet } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  context: 'setup' | 'settings';
  space: ExtendedSpace;
  error: string | Record<string, any>;
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);

const treasuryObj = {
  name: '',
  address: '',
  network: ''
};

const modalTreasuryOpen = ref(false);
const modalOsnapOpen = ref(false);
const currentTreasuryIndex = ref<number | null>(null);
const currentTreasury = ref<TreasuryWallet>(clone(treasuryObj));
const hasOsnapPlugin = computed(() => {
  return Object.keys(props.space.plugins).includes('oSnap');
});
const isOsnapEnabledOnCurrentTreasury = ref(false);

function handleRemoveTreasury(i: number) {
  form.value.treasuries = form.value.treasuries.filter(
    (treasury, index) => index !== i
  );
}

function handleEditTreasury(i: number) {
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

function handleSubmitTreasury(treasury: TreasuryWallet) {
  if (currentTreasuryIndex.value !== null) {
    const treasuriesClone = clone(form.value.treasuries);
    treasuriesClone[currentTreasuryIndex.value] = treasury;
    form.value.treasuries = treasuriesClone;
  } else {
    form.value.treasuries = form.value.treasuries.concat(treasury);
  }
}

function handleOpenConfigureOsnapModal(
  treasuryIndex: number,
  isEnabled: boolean
) {
  if (props.isViewOnly || !hasOsnapPlugin.value) return;
  currentTreasuryIndex.value = treasuryIndex;
  currentTreasury.value = clone(form.value.treasuries[treasuryIndex]);
  isOsnapEnabledOnCurrentTreasury.value = isEnabled;
  modalOsnapOpen.value = true;
}

function handleCloseConfigureOsnapModal() {
  modalOsnapOpen.value = false;
  isOsnapEnabledOnCurrentTreasury.value = false;
}
</script>

<template>
  <BaseBlock :title="$t('settings.treasuries.label')">
    <div v-if="hasOsnapPlugin && form.treasuries.length === 0" class="mb-3">
      <h2>Warning: no treasuries</h2>
      <p>
        You have installed the oSnap plugin, but you don't have any treasuries.
      </p>
      <p>
        Please add a Safe as a treasury and enable oSnap on it to use the oSnap
        plugin.
      </p>
    </div>
    <div v-if="form.treasuries.length" class="mb-3 grid gap-3">
      <SettingsTreasuriesBlockItem
        :treasuries="form.treasuries"
        :is-view-only="isViewOnly"
        :has-osnap-plugin="hasOsnapPlugin"
        @edit-treasury="i => handleEditTreasury(i)"
        @remove-treasury="i => handleRemoveTreasury(i)"
        @configure-osnap="handleOpenConfigureOsnapModal"
      />
    </div>

    <TuneButton
      :disabled="isViewOnly"
      class="block w-full"
      @click="handleAddTreasury"
    >
      {{ $t('settings.treasuries.add') }}
    </TuneButton>

    <MessageWarningTestnet context="Treasury" :error="error" />

    <teleport to="#modal">
      <ModalTreasury
        :open="modalTreasuryOpen"
        :treasury="currentTreasury"
        @close="modalTreasuryOpen = false"
        @add="handleSubmitTreasury"
      />
      <ModalOsnap
        v-if="hasOsnapPlugin"
        :open="modalOsnapOpen"
        :treasury="currentTreasury"
        :space-name="form.name"
        :is-osnap-enabled="isOsnapEnabledOnCurrentTreasury"
        @close="handleCloseConfigureOsnapModal"
      />
    </teleport>
  </BaseBlock>
</template>
