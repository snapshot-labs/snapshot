<script setup lang="ts">
import { BoostSubgraph } from '@/helpers/boost/types';
import { explorerUrl, openProfile } from '@/helpers/utils';

const props = defineProps<{
  boost: BoostSubgraph;
  claimedTransactionHash?: string;
}>();

const { domain } = useApp();
const router = useRouter();

function handleAction(action: string) {
  if (action === 'viewEtherscan') {
    window.open(
      explorerUrl(props.boost.chainId, props.boost.transaction, 'tx'),
      '_blank'
    );
  } else if (action === 'seeCreatorProfile') {
    openProfile(props.boost.owner, domain, router);
  } else if (action === 'viewClaimEtherscan') {
    window.open(
      explorerUrl(props.boost.chainId, props.claimedTransactionHash!, 'tx'),
      '_blank'
    );
  }
}

const items = computed(() => {
  const itemList = [{ text: 'View boost', action: 'viewEtherscan' }];

  if (props.claimedTransactionHash) {
    itemList.push({
      text: 'View claim ',
      action: 'viewClaimEtherscan'
    });
  }

  itemList.push({ text: 'Creator profile', action: 'seeCreatorProfile' });

  return itemList;
});
</script>

<template>
  <BaseMenu :items="items" @select="handleAction">
    <template #button>
      <BaseButtonIcon class="absolute right-2 top-[6px]">
        <i-ho-dots-horizontal class="text-[18px]" />
      </BaseButtonIcon>
    </template>
  </BaseMenu>
</template>
