<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { getDelegators } from '@/helpers/delegation';
import { useSpaces } from '@/composables/useSpaces';
import uniqBy from 'lodash/uniqBy';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps<{
  userAddress: string;
  followingSpaces: { space: { id: string } }[];
  loadingSpaces: boolean;
}>();

const { spaces, spacesLoaded } = useSpaces();
const { web3Account } = useWeb3();

const delegators = ref<{ delegator: string; space: string }[] | null>(null);

// Only show delegators of spaces that the users follows
// This is to avoid prevent spam showing up in the user profile
const filteredDelegatorSpaces = computed(() => {
  if (!delegators.value) return [];

  const followingSpaceIds = props.followingSpaces.map(s => s.space.id);
  const delegatorSpaceIds = delegators.value
    .map(d => d.space)
    .filter(d => d !== '');

  return uniqBy(delegatorSpaceIds.filter(d => followingSpaceIds.includes(d)));
});

async function loadDelegators() {
  const res = await getDelegators('4', props.userAddress);
  delegators.value = res.delegations ?? [];
}

onMounted(async () => {
  loadDelegators();
});

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
      :loading="!spacesLoaded || loadingSpaces || !delegators"
      slim
      title="delegator for"
      :counter="filteredDelegatorSpaces.length"
      hideBottomBorder
    >
      <ProfileAboutDelegateListItem
        :spaces="spaces"
        :delegatorSpaces="filteredDelegatorSpaces"
        :userAddress="userAddress"
        :web3Account="web3Account"
        @delegate="clickDelegate"
      />
    </BaseBlock>
  </div>
  <Teleport to="#modal">
    <ModalDelegate
      :open="modalDelegateOpen"
      @close="modalDelegateOpen = false"
      :userAddress="userAddress"
      :spaceId="delegateSpaceId"
    />
  </Teleport>
</template>
