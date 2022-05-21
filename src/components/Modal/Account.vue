<script setup>
import { toRefs, computed } from 'vue';
import { getInjected } from '@snapshot-labs/lock/src/utils';
import connectors from '@/helpers/connectors.json';
import { getIpfsUrl } from '@/helpers/utils';

const props = defineProps(['open']);

defineEmits(['login', 'close']);

const { open } = toRefs(props);

const injected = computed(() => getInjected());
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{ $t('connectWallet') }}
      </h3>
    </template>
    <div>
      <div class="m-4 space-y-2">
        <a
          v-for="(connector, id, i) in connectors"
          :key="i"
          @click="$emit('login', connector.id)"
          class="block"
        >
          <BaseButton
            v-if="id === 'injected' && injected"
            class="button-outline w-full flex justify-center items-center"
          >
            <img
              :src="getIpfsUrl(injected.icon)"
              height="28"
              width="28"
              class="mr-2 -mt-1"
              :alt="injected.name"
            />
             <div style="text-align: left">
              <span v-if="injected.id==='trustwallet'">Browser Wallet</span>
              <span v-if="injected.id==='trustwallet'" style="display:block">(ioPay, Metamask, Trust, etc.)</span>
              <span v-else>{{injected.name}}</span>
            </div>
          </BaseButton>
          <BaseButton
            v-else-if="id !== 'gnosis' && id !== 'injected'"
            class="button-outline w-full flex justify-center items-center gap-2"
          >
            <img
              :src="getIpfsUrl(connector.icon)"
              height="25"
              width="25"
              :alt="connector.name"
            />
            <span>{{ connector.name }}</span>
          </BaseButton>
        </a>
      </div>
    </div>
  </BaseModal>
</template>
