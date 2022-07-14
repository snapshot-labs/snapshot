<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';

const { modalAccountOpen } = useModal();
const { web3Account } = useWeb3();
</script>

<template>
  <div>
    <div class="space-y-4">
      {{ $t('header.description') }}

      <SetupMessageHelp />
    </div>
    <BaseButton
      primary
      class="float-right mt-4"
      @click="
        !web3Account
          ? (modalAccountOpen = true)
          : $router.push({ query: { step: 2 } })
      "
    >
      {{ $t('getStarted') }}
    </BaseButton>
  </div>
</template>
