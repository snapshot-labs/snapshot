<script setup lang="ts">
const { pendingTransactions, pendingTransactionsWithHash } = useTxStatus();
const { env, showSidebar, domain } = useApp();
const { web3Account } = useWeb3();

const showDemoBanner = ref(true);
const showPendingTransactionsModal = ref(false);

watch(
  () => pendingTransactionsWithHash.value.length === 0,
  () => {
    showPendingTransactionsModal.value = false;
  }
);
</script>

<template>
  <div
    v-if="env === 'demo' && showDemoBanner"
    class="relative bg-primary p-3 text-center"
    style="color: white; font-size: 20px"
  >
    {{ $t('demoSite') }}
    <BaseButtonIcon
      class="absolute right-3 top-[10px]"
      @click="showDemoBanner = false"
    >
      <i-ho-x />
    </BaseButtonIcon>
  </div>
  <div>
    <div class="px-3 sm:px-4">
      <div class="flex items-center py-[12px]">
        <div class="flex flex-auto items-center">
          <BaseButtonRound
            class="sm:hidden"
            @click="showSidebar = !showSidebar"
          >
            <i-ho-menu class="text-skin-link" />
          </BaseButtonRound>
          <router-link
            :to="{ path: '/' }"
            class="hidden items-center sm:block"
            style="font-size: 24px"
          >
            snapshot
          </router-link>
        </div>
        <div :key="web3Account" class="flex space-x-2">
          <NavbarAccount />

          <NavbarNotifications v-if="web3Account && !domain" />

          <NavbarExtras />
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="pendingTransactions.length > 0"
    class="flex flex-row items-center justify-center gap-x-3 bg-primary py-2 text-center text-white"
    :class="{
      'cursor-pointer': pendingTransactions.length > 0
    }"
    @click="
      pendingTransactionsWithHash.length
        ? (showPendingTransactionsModal = true)
        : null
    "
  >
    <LoadingSpinner fill-white class="mb-1" />
    <span>
      {{ $t('setup.pendingTransactions') }}:
      {{ pendingTransactions.length }}
    </span>
  </div>
  <Teleport to="#modal">
    <ModalPendingTransactions
      :open="showPendingTransactionsModal"
      @close="showPendingTransactionsModal = false"
    />
  </Teleport>
</template>
