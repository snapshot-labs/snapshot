<script setup lang="ts">
import { watch, ref, computed } from 'vue';
import { getDelegators } from '@/helpers/delegation';
import { useSpaces } from '@/composables/useSpaces';
import uniqBy from 'lodash/uniqBy';
import { useWeb3 } from '@/composables/useWeb3';
import { useDelegate } from '@/composables/useDelegate';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const props = defineProps<{
  userAddress: string;
  followingSpaces: { space: { id: string } }[];
  loadingFollowedSpaces: boolean;
}>();

const { spaces, spacesLoaded } = useSpaces();
const { web3Account } = useWeb3();
const { networkKey } = useDelegate();

const delegators = ref<{ delegator: string; space: string }[] | null>(null);

// Filter delegators by the spaces the user is following
const delegatorsFilteredBySpaces = computed(() => {
  if (!delegators.value) return [];

  const followingSpaceIds = props.followingSpaces.map(s => s.space.id);
  const delegatorSpaceIds = delegators.value
    .map(d => d.space)
    .filter(d => d !== '');

  return uniqBy(delegatorSpaceIds.filter(d => followingSpaceIds.includes(d)));
});

async function loadDelegatorsByNetwork() {
  const res = await getDelegators(networkKey.value, props.userAddress);
  delegators.value = res.delegations ?? [];
}

watch(
  networkKey,
  async () => {
    if (!web3Account.value) return;
    loadDelegatorsByNetwork();
  },
  { immediate: true }
);

// Delegate modal
const modalDelegateOpen = ref(false);
const delegateSpaceId = ref('');

function clickDelegate(id) {
  delegateSpaceId.value = id;
  modalDelegateOpen.value = true;
}
</script>

<template>
  <div>
    <BaseBlock
      :loading="!spacesLoaded || loadingFollowedSpaces"
      :title="$t('profile.about.delegateFor')"
      :counter="delegatorsFilteredBySpaces.length"
      :label="
        networks?.[networkKey]?.shortName ??
        networks?.[networkKey]?.name ??
        $t('theCurrentNetwork')
      "
      :label-tooltip="$t('profile.about.delegatorNetworkInfo')"
      hide-bottom-border
      slim
    >
      <ProfileAboutDelegateListItem
        v-if="delegatorsFilteredBySpaces.length && spacesLoaded && delegators"
        :spaces="spaces"
        :delegatorsFilteredBySpaces="delegatorsFilteredBySpaces"
        :delegators="delegators"
        :userAddress="userAddress"
        :web3Account="web3Account"
        @delegate="clickDelegate"
      />
      <div v-else class="p-4 border-t">
        {{
          $t('profile.about.noDelegatorsMessage', {
            network:
              networks?.[networkKey]?.shortName ??
              networks?.[networkKey]?.name ??
              $t('theCurrentNetwork')
          })
        }}
      </div>
    </BaseBlock>
  </div>
  <Teleport to="#modal">
    <ModalDelegate
      :open="modalDelegateOpen"
      @close="modalDelegateOpen = false"
      @reload="loadDelegatorsByNetwork"
      :userAddress="userAddress"
      :spaceId="delegateSpaceId"
    />
  </Teleport>
</template>
