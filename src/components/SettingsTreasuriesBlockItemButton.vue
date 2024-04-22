<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';
import { Network } from '@/plugins/oSnap/types';
import { ConfigError, getIsOsnapEnabled } from '@/plugins/oSnap/utils/getters';

const props = defineProps<{
  treasury: TreasuryWallet;
  treasuryIndex: number;
  isViewOnly?: boolean;
  hasOsnapPlugin: boolean;
}>();

const emit = defineEmits<{
  removeTreasury: [index: number];
  editTreasury: [index: number];
  configureOsnap: [index: number, isEnabled: boolean];
}>();

const isOsnapEnabled = ref(false);
const isChainSupported = ref(true);

async function updateIsOsnapEnabled() {
  if (!props.hasOsnapPlugin) return;
  const isEnabled = await getIsOsnapEnabled(
    props.treasury.network as Network,
    props.treasury.address
  ).catch(e => {
    if (e instanceof ConfigError) {
      isChainSupported.value = false;
      return false;
    }
    return false;
  });
  isOsnapEnabled.value = isEnabled;
}

onMounted(async () => {
  await updateIsOsnapEnabled();
  window.addEventListener('focus', updateIsOsnapEnabled);
});

onUnmounted(() => {
  window.removeEventListener('focus', updateIsOsnapEnabled);
});
</script>

<template>
  <button
    class="flex h-full w-full items-center justify-between truncate rounded-md border p-4"
    :class="{ 'cursor-default': isViewOnly }"
    @click="emit('editTreasury', treasuryIndex)"
  >
    <div class="flex items-center gap-2 truncate pr-[20px] text-left">
      <h4 class="truncate">{{ treasury.name }}</h4>
    </div>
    <div v-if="hasOsnapPlugin" class="ml-auto mr-3">
      <SettingsTreasuryActivateOsnapButton
        v-if="isChainSupported"
        :is-osnap-enabled="isOsnapEnabled"
        @click.stop="
          !isViewOnly && emit('configureOsnap', treasuryIndex, isOsnapEnabled)
        "
      />
      <div v-else>oSnap unavailable</div>
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
