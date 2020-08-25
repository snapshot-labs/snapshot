<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 mb-0 text-center">About</h3>
    <div class="m-4 mb-0 p-4 border rounded-2 text-white">
      <div class="d-flex">
        <span v-text="'Twitter'" class="flex-auto text-gray mr-1" />
        <a href="https://twitter.com/SnapshotLabs" target="_blank">
          @SnapshotLabs
        </a>
      </div>
      <div class="d-flex">
        <span v-text="'Discord'" class="flex-auto text-gray mr-1" />
        <a href="https://discord.snapshot.page" target="_blank">
          Join Discord
        </a>
      </div>
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
        {{ config.network === 'homestead' ? 'mainnet' : config.network }}
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
    <div class="m-4">
      <a
        :href="`https://github.com/${pkg.repository}`"
        target="_blank"
        class="mb-2 d-block"
      >
        <UiButton class="button-outline width-full">
          <Icon name="github" class="mr-1" />
          github.com/{{ pkg.repository }}
          <Icon name="external-link" class="ml-1" />
        </UiButton>
      </a>
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
