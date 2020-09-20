<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">About</h3>
    <div class="text-center">
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
    <div class="m-4 p-4 border rounded-2 text-white">
      <div class="d-flex">
        <span v-text="'Version'" class="flex-auto text-gray mr-1" />
        {{ pkg.version }}
      </div>
      <div class="d-flex">
        <span v-text="'License'" class="flex-auto text-gray mr-1" />
        {{ pkg.license }}
      </div>
      <div class="d-flex">
        <span v-text="'Network'" class="flex-auto text-gray mr-1" />
        {{ web3.network.name }}
      </div>
      <div class="d-flex">
        <span v-text="'Block number'" class="flex-auto text-gray mr-1" />
        <a
          :href="_etherscanLink(web3.blockNumber, 'block')"
          target="_blank"
          class="float-right"
        >
          {{ $n(web3.blockNumber) }}
          <Icon name="external-link" class="ml-1" />
        </a>
      </div>
      <div class="d-flex">
        <span v-text="'IPFS server'" class="flex-auto text-gray mr-1" />
        {{ ipfsNode }}
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

export default {
  props: ['open'],
  data() {
    return {
      pkg,
      hubUrl: process.env.VUE_APP_HUB_URL,
      ipfsNode: process.env.VUE_APP_IPFS_NODE
    };
  }
};
</script>
