<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { shortenAddress } from '@/helpers/utils';
import { getNFTInfo, NFTInfo } from '@/helpers/transactionBuilder';
import { decodeERC721TransferData } from '@/helpers/abi';
import { Transaction } from '@/helpers/safe';
import { useProfiles } from '@/composables';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  transaction: Transaction;
  network: string;
}>();

const { profiles, loadProfiles } = useProfiles();

const recipient = ref<string>('');
const recipientENS = ref<string>('');
const nftInfo = ref<NFTInfo>();

onMounted(async () => {
  const params = decodeERC721TransferData(props.transaction.data);
  recipient.value = params.recipient;
  nftInfo.value = await getNFTInfo(
    props.transaction.to,
    params.tokenId,
    props.network
  );

  await loadProfiles([recipient.value]);
  recipientENS.value = profiles.value[recipient.value]?.ens || '';
});
</script>

<template>
  <div class="flex items-center">
    <template v-if="nftInfo">
      <img
        :src="getUrl(nftInfo.metadata.image)"
        class="mr-2 h-4 w-4 rounded-md"
        :alt="nftInfo.metadata.image"
      />
      Transfer NFT {{ nftInfo?.tokenId }} of {{ nftInfo.collectionName }} to
      {{ recipientENS || shortenAddress(recipient) }}
    </template>
  </div>
</template>
