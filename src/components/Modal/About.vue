<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>About</h3>
    </template>
    <div class="text-center mt-4">
      <a href="https://twitter.com/SnapshotLabs" target="_blank">
        <Icon size="32" name="twitter" class="mr-1 mx-2" />
      </a>
      <a href="https://discord.snapshot.page" target="_blank">
        <Icon size="32" name="discord" class="mr-1 mx-2" />
      </a>
      <a href="https://t.me/snapshotlabs" target="_blank">
        <Icon size="32" name="telegram" class="mr-1 mx-2" />
      </a>
      <a :href="`https://github.com/${pkg.repository}`" target="_blank">
        <Icon size="32" name="github" class="mr-1 mx-2" />
      </a>
      <a href="https://gitcoin.co/grants/1093/snapshot" target="_blank">
        <Icon size="32" name="loveit" class="mr-1 mx-2" />
      </a>
    </div>
    <div class="m-4 p-4 mt-3 border rounded-2 text-white">
      <div class="d-flex">
        <span v-text="'Version'" class="flex-auto text-gray mr-1" />
        <a
          v-if="commitSha"
          :href="`https://github.com/${pkg.repository}/tree/${commitSha}`"
          target="_blank"
        >
          {{ pkg.version }}#{{ commitSha.slice(0, 7) }}
        </a>
        <span v-else v-text="pkg.version" />
      </div>
      <div class="d-flex">
        <span v-text="'License'" class="flex-auto text-gray mr-1" />
        {{ pkg.license }}
      </div>
      <div class="d-flex">
        <span v-text="'Network'" class="flex-auto text-gray mr-1" />
        <a :href="web3.network.explorer" target="_blank">
          {{ web3.network.network }} ({{ web3.network.key }})
        </a>
      </div>
      <div class="d-flex">
        <span v-text="'IPFS server'" class="flex-auto text-gray mr-1" />
        {{ gateway }}
      </div>
      <div class="d-flex">
        <span v-text="'Hub'" class="flex-auto text-gray mr-1" />
        {{ hubUrl }}
      </div>
    </div>
  </UiModal>
</template>

<script>
import pkg from '@/../package.json';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';

const gateway = process.env.VUE_APP_IPFS_GATEWAY || gateways[0];

export default {
  props: ['open'],
  emits: ['close'],
  data() {
    return {
      pkg,
      commitSha: process.env.VUE_APP_COMMIT_SHA,
      hubUrl: process.env.VUE_APP_HUB_URL,
      gateway
    };
  }
};
</script>
