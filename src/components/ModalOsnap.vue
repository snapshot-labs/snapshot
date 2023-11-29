<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';
import { Network } from '@/plugins/oSnap/types';
import { makeConfigureOsnapUrl } from '@/plugins/oSnap/utils/getters';

const props = defineProps<{
  open: boolean;
  isOsnapEnabled: boolean;
  treasury: TreasuryWallet;
  spaceName: string;
}>();
defineEmits<{
  (e: 'close'): void;
}>();
const spaceUrl = window.location.href.replace('/settings', '');
const href = computed(() =>
  makeConfigureOsnapUrl({
    spaceUrl,
    spaceName: props.spaceName,
    safeAddress: props.treasury.address,
    network: props.treasury.network as Network
  })
);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 v-text="'Configure oSnap'" />
    </template>
    <div class="m-4 grid grid-cols-[auto,auto] gap-2">
      <i-ho-information-circle class="mt-1 text-sm" />
      <p class="text-sm">
        oSnap seamlessly integrates with Snapshot and your treasury,
        automatically executing governance votes on-chain. Bypass the need for
        privileged signers to create a DAO that's more efficient and truly
        decentralized.
        <BaseLink class="mt-1 block text-skin-link" link="https://uma.xyz/osnap"
          >Learn more</BaseLink
        >
      </p>
    </div>

    <template #footer>
      <a
        :href="href"
        target="_blank"
        class="block w-full rounded-full py-[12px] text-white"
        :class="
          isOsnapEnabled ? 'bg-[hsl(349,65%,52%)]' : 'bg-[hsl(240,83%,58%)]'
        "
        @click.stop="$emit('close')"
      >
        {{ isOsnapEnabled ? 'Deactivate' : 'Activate' }} oSnap
        <i-ho-external-link class="mb-[2px] ml-1 inline-block text-xs" />
      </a>
      <p class="mt-2 text-xs text-skin-text">
        Note that the deactivation process takes place in the Safe app
      </p>
    </template>
  </BaseModal>
</template>
