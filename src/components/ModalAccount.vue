<script setup lang="ts">
import { getInjected } from '@snapshot-labs/lock/src/utils';
import connectors from '@/helpers/connectors';
import { getIpfsUrl } from '@/helpers/utils';

const props = defineProps<{
  open: boolean;
}>();

defineEmits(['login', 'close', 'openTerms']);

const { open } = toRefs(props);

const isShowingAllConnectors = ref(false);

const injected = computed(() => getInjected());

const filteredConnectors = computed(() => {
  const baseConnectors = ['injected', 'walletconnect', 'walletlink'];
  // If injected is Coinbase, hide WalletLink
  if (injected.value?.name === 'Coinbase') connectors.walletlink.hidden = true;
  if (isShowingAllConnectors.value) return Object.keys(connectors);
  return Object.keys(connectors).filter(cId => baseConnectors.includes(cId));
});

watch(open, () => {
  isShowingAllConnectors.value = false;
});
</script>

<template>
  <TuneModal :open="open" @close="$emit('close')">
    <TuneModalTitle as="h4" class="mx-3 mt-3">
      Connect to Snapshot
    </TuneModalTitle>
    <!-- TODO: Enable when TOS ready and remember to enable disconnect in useApp -->
    <!-- <TuneModalDescription class="mx-3 pb-3">
      By connecting, you agree to
      <a
        role="button"
        tabindex="0"
        class="font-semibold"
        @click="$emit('openTerms')"
        @keyup.enter="$emit('openTerms')"
      >
        Snapshot Labs' Terms of Service</a
      >.
    </TuneModalDescription> -->
    <div>
      <div class="m-3 space-y-2">
        <div
          v-for="cId in filteredConnectors"
          :key="cId"
          class="block"
          @click="$emit('login', connectors[cId].id)"
        >
          <TuneButton
            v-if="cId === 'injected' && injected"
            class="flex w-full items-center justify-center"
            data-testid="button-connnect-wallet-injected"
          >
            <img
              :src="getIpfsUrl(injected.icon)"
              height="28"
              width="28"
              class="-mt-1 mr-2"
              :alt="injected.name"
            />
            {{ injected.name }}
          </TuneButton>
          <TuneButton
            v-else-if="cId !== 'injected' && !connectors[cId].hidden"
            class="flex w-full items-center justify-center gap-2"
          >
            <img
              :src="getIpfsUrl(connectors[cId].icon)"
              height="25"
              width="25"
              :alt="connectors[cId].name"
            />
            <span>{{ connectors[cId].name }}</span>
          </TuneButton>
        </div>
        <TuneButton
          v-if="!isShowingAllConnectors"
          class="flex w-full items-center justify-center gap-1"
          @click="isShowingAllConnectors = true"
        >
          {{ $t('showMore') }}
          <i-ho-chevron-down class="text-sm text-skin-link" />
        </TuneButton>
      </div>
    </div>
  </TuneModal>
</template>
