<script setup lang="ts">
import { BoostSubgraph } from '@/helpers/boost/types';
import { explorerUrl, openProfile } from '@/helpers/utils';

const props = defineProps<{
  boost: BoostSubgraph;
  claimedTransactionHash?: string;
  showWinners?: boolean;
}>();

const emit = defineEmits(['openWinnersModal']);

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
  } else if (action === 'viewWinners') {
    emit('openWinnersModal');
  }
}

const items = computed(() => {
  const itemList: any = [
    { text: 'View boost', action: 'viewEtherscan', extras: { external: true } }
  ];

  if (props.claimedTransactionHash) {
    itemList.push({
      text: 'View claim ',
      action: 'viewClaimEtherscan',
      extras: { external: true }
    });
  }

  if (props.showWinners) {
    itemList.push({ text: 'View winners', action: 'viewWinners' });
  }

  itemList.push({ text: 'Creator profile', action: 'seeCreatorProfile' });

  return itemList;
});
</script>

<template>
  <BaseMenu :items="items" @select="handleAction">
    <template #button>
      <BaseButtonIcon class="absolute right-[-4px] top-[-5px]">
        <i-ho-dots-horizontal class="text-[18px]" />
      </BaseButtonIcon>
    </template>
    <template #item="{ item }">
      <div class="flex items-center gap-2">
        <span>{{ item.text }}</span>
        <i-ho-external-link v-if="item.extras?.external" class="text-xs" />
      </div>
    </template>
  </BaseMenu>
</template>
