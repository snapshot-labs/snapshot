<script setup lang="ts">
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
      <TuneButton
        primary
        class="float-right mt-4 w-full"
        @click="!web3Account ? (modalAccountOpen = true) : emit('next')"
      >
        {{ $t('getStarted') }}
      </TuneButton>
    </div>
  </div>
</template>
