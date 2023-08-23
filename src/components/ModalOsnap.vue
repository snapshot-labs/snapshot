<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  open: boolean;
  isOsnapEnabled: boolean;
  treasury: TreasuryWallet;
}>()
defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3
        v-text="'Configure oSnap'"
      />
    </template>
    <div class="m-4">
      <div>
        <div class="space-y-3">
          <p>
            oSnap seamlessly integrates with Snapshot and your treasury, automatically executing governance votes on-chain. Bypass the need for privileged signers to create a DAO that's more efficient and truly decentralized.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton
        class="w-full"
        :primary="!isOsnapEnabled"
        :variant="isOsnapEnabled ? 'danger' : undefined"
      >
        {{ isOsnapEnabled ? 'Deactivate' : 'Activate' }} oSnap
      </BaseButton>
    </template>
  </BaseModal>
</template>