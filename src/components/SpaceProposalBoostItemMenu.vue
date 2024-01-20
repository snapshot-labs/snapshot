<script setup lang="ts">
import { BoostSubgraphResult } from '@/helpers/interfaces';
import { explorerUrl } from '@/helpers/utils';
import { openProfile } from '@/helpers/utils';

const props = defineProps<{
  boost: BoostSubgraphResult;
}>();

const { domain } = useApp();
const router = useRouter();

function handleAction(action: string) {
  if (action === 'viewEtherscan') {
    window.open(
      explorerUrl(props.boost.chainId, props.boost.token.id),
      // TODO: Use boost tx hash
      '_blank'
    );
  } else if (action === 'seeCreatorProfile') {
    openProfile(props.boost.owner, domain, router);
  }
}
</script>

<template>
  <BaseMenu
    :items="[
      { text: 'View on Etherscan', action: 'viewEtherscan' },
      {
        text: 'See creator profile',
        action: 'seeCreatorProfile'
      }
    ]"
    @select="handleAction"
  >
    <template #button>
      <BaseButtonIcon class="absolute right-2 top-[6px]">
        <i-ho-dots-horizontal class="text-[18px]" />
      </BaseButtonIcon>
    </template>
  </BaseMenu>
</template>
