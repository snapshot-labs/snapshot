<script setup>
import pkg from '@/../package.json';
import languages from '@/locales/languages.json';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
import { useWeb3 } from '@/composables/useWeb3';

defineProps(['open']);

const emit = defineEmits(['close', 'openLang']);

const { web3 } = useWeb3();

const gateway = import.meta.env.VITE_IPFS_GATEWAY || gateways[0];
const commitSha = import.meta.env.VITE_COMMIT_SHA;
const hubUrl = import.meta.env.VITE_HUB_URL;

function changeLang() {
  emit('openLang');
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('about') }}</h3>
    </template>
    <div class="text-center mt-4 space-x-3">
      <a href="https://twitter.com/SnapshotLabs" target="_blank">
        <Icon size="32" name="twitter" class="hover:opacity-80" />
      </a>
      <a href="https://discord.gg/snapshot" target="_blank">
        <Icon size="32" name="discord" class="hover:opacity-80" />
      </a>
      <a href="https://t.me/snapshotlabs" target="_blank">
        <Icon size="32" name="telegram" class="hover:opacity-80" />
      </a>
      <a :href="`https://github.com/${pkg.repository}`" target="_blank">
        <Icon size="32" name="github" class="hover:opacity-80" />
      </a>
      <a href="https://docs.snapshot.org/" target="_blank">
        <Icon size="32" name="gitbook" class="hover:opacity-80" />
      </a>
      <a href="https://gitcoin.co/grants/1093/snapshot" target="_blank">
        <Icon size="32" name="loveit" class="hover:opacity-80" />
      </a>
    </div>
    <div class="m-4 p-4 mt-3 space-y-1 border rounded-md link-color">
      <div class="flex">
        <span v-text="$t('language')" class="flex-auto text-color mr-1" />
        <a @click="changeLang()">{{ languages[$i18n.locale]?.name }}</a>
      </div>
      <div class="flex">
        <span v-text="$t('version')" class="flex-auto text-color mr-1" />
        <a
          v-if="commitSha"
          :href="`https://github.com/${pkg.repository}/tree/${commitSha}`"
          target="_blank"
        >
          {{ pkg.version }}#{{ commitSha.slice(0, 7) }}
        </a>
        <span v-else v-text="pkg.version" />
      </div>
      <div class="flex">
        <span v-text="$t('license')" class="flex-auto text-color mr-1" />
        {{ pkg.license }}
      </div>
      <div class="flex">
        <span v-text="$t('network')" class="flex-auto text-color mr-1" />
        <a :href="web3.network.explorer" target="_blank">
          {{ web3.network.network }} ({{ web3.network.key }})
        </a>
      </div>
      <div class="flex">
        <span v-text="$t('ipfsServer')" class="flex-auto text-color mr-1" />
        {{ gateway }}
      </div>
      <div class="flex">
        <span v-text="$t('hub')" class="flex-auto text-color mr-1" />
        {{ hubUrl }}
      </div>
    </div>
  </UiModal>
</template>
