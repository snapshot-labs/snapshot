<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';

const { modalAccountOpen } = useModal();
const { web3Account } = useWeb3();

const emit = defineEmits(['next']);
</script>

<template>
  <div>
    <div class="px-4 md:px-0">
      {{ $t('header.description') }}
    </div>

    <SetupMessageHelp />

    <div class="px-4 md:px-0">
      <BaseButton
        primary
        class="float-right mt-4 w-full"
        @click="!web3Account ? (modalAccountOpen = true) : emit('next')"
      >
        {{ $t('getStarted') }}
      </BaseButton>
    </div>
  </div>
</template>
