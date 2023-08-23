<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';
import { getIsOsnapEnabled } from '@/plugins/safeSnap/utils/umaModule';

const props = defineProps<{
  treasury: TreasuryWallet;
  treasuryIndex: number;
  isViewOnly?: boolean;
}>();

const emit = defineEmits(['removeTreasury', 'editTreasury']);

const isOsnapEnabled = ref(false);

onMounted(async () => {
  isOsnapEnabled.value = await getIsOsnapEnabled(props.treasury.network, props.treasury.address);
})
</script>

<template>
  <button
      class="flex h-full truncate w-full items-center justify-between rounded-md border p-4"
      :class="{ 'cursor-default': isViewOnly }"
      @click="emit('editTreasury', treasuryIndex)"
    >
      <div class="flex items-center gap-2 truncate pr-[20px] text-left">
        <h4 class="truncate">{{ treasury.name }}</h4>
      </div>
      <div class="ml-auto mr-3">
        <SettingsTreasuryActivateOsnapButton :is-osnap-enabled="isOsnapEnabled" />
      </div>
      <BaseButtonIcon
        v-show="!isViewOnly"
        class="-mr-2"
        @click.stop="emit('removeTreasury', treasuryIndex)"
      >
        <BaseIcon name="close" size="14" />
      </BaseButtonIcon>
    </button>
</template>