<script setup>
import pkg from '@/../package.json';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
import { useWeb3 } from '@/composables/useWeb3';
import { useHub } from '@/composables/useHub';

defineProps(['open']);

defineEmits(['close', 'openLang']);

const { web3 } = useWeb3();
const { hubUrl, defaultHubUrl, isDefaultHubUrl } = useHub();

const gateway = import.meta.env.VITE_IPFS_GATEWAY || gateways[0];
const commitSha = import.meta.env.VITE_COMMIT_SHA;
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('about') }}</h3>
    </template>
    <div class="m-4 space-y-1 text-skin-link">
      <div class="flex">
        <span v-text="$t('version')" class="flex-auto text-skin-text mr-1" />
        <BaseLink
          v-if="commitSha"
          :link="`https://github.com/${pkg.repository}/tree/${commitSha}`"
        >
          {{ pkg.version }}#{{ commitSha.slice(0, 7) }}
        </BaseLink>
        <span v-else v-text="pkg.version" />
      </div>
      <div class="flex">
        <span v-text="$t('license')" class="flex-auto text-skin-text mr-1" />
        {{ pkg.license }}
      </div>
      <div class="flex">
        <span v-text="$t('network')" class="flex-auto text-skin-text mr-1" />
        <BaseLink :link="web3.network.explorer" hide-external-icon>
          {{ web3.network.network }} ({{ web3.network.key }})
        </BaseLink>
      </div>
      <div class="flex">
        <span v-text="$t('ipfsServer')" class="flex-auto text-skin-text mr-1" />
        {{ gateway }}
      </div>
      <div class="flex">
        <span v-text="$t('hub')" class="flex-auto text-skin-text mr-1" />
        <input type="url" v-model="hubUrl" class="text-right input mr-1" :readonly="isHubEditable" />
        <a v-if="!isDefaultHubUrl" @click="hubUrl = defaultHubUrl" class="text-red">
          <BaseIcon name="close" size="12" />
        </a>
      </div>
    </div>
  </BaseModal>
</template>
