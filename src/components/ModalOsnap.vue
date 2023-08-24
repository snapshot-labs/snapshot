<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';
import { makeConfigureOsnapUrl } from '@/plugins/safeSnap/utils/umaModule';

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
  makeConfigureOsnapUrl(
    props.spaceName,
    spaceUrl,
    props.treasury.address,
    props.treasury.network
  )
);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 v-text="'Configure oSnap'" />
    </template>
    <div class="m-4 grid grid-cols-[auto,auto] gap-2">
        <i-ho-information-circle class="text-sm mt-1" />
        <p class="text-sm">
          oSnap seamlessly integrates with Snapshot and your treasury,
          automatically executing governance votes on-chain. Bypass the need for
          privileged signers to create a DAO that's more efficient and truly
          decentralized.
      <BaseLink class="text-[hsl(240,83%,58%)] block mt-1" link="https://uma.xyz/osnap">Learn more</BaseLink>
        </p>
    </div>

    <template #footer>
      <a
        :href="href"
        target="_blank"
        class="block w-full rounded-full py-[12px] text-white"
        :class="
          isOsnapEnabled ? 'bg-[hsl(349,65%,52%)]' : 'bg-[hsl(240,83%,58%]'
        "
      >
        {{ isOsnapEnabled ? 'Deactivate' : 'Activate' }} oSnap
        <i-ho-external-link class="mb-[2px] ml-1 inline-block text-xs" />
      </a>
      <p class="text-black/50 text-xs mt-2">Note that the deactivation process takes place in the Safe app</p>
    </template>
  </BaseModal>
</template>
