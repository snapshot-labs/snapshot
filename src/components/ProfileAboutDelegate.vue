<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { getDelegators } from '@/helpers/delegation';
import { useSpaces } from '@/composables/useSpaces';

const props = defineProps<{
  userAddress: string;
  followingSpaces: { space: { id: string } }[];
  loadingSpaces: boolean;
}>();

const { spaces, spacesLoaded } = useSpaces();

const delegators = ref<{ delegator: string; space: string }[] | null>(null);

const delegatorSpaces = computed(() => {
  if (!delegators.value) return [];

  const followingSpaceIds = props.followingSpaces.map(s => s.space.id);
  const delegatorSpaceIds = delegators.value
    .map(d => d.space)
    .filter(d => d !== '');

  return delegatorSpaceIds.filter(d => followingSpaceIds.includes(d));
});

async function loadDelegators() {
  const res = await getDelegators('4', props.userAddress);
  delegators.value = res.delegations;
}

onMounted(async () => {
  loadDelegators();
});
</script>

<template>
  <div>
    <BaseBlock
      :loading="!spacesLoaded || loadingSpaces"
      slim
      title="delegator for"
      :counter="delegatorSpaces.length"
      hideBottomBorder
    >
      <ProfileAboutDelegateListItem
        :spaces="spaces"
        :delegatorSpaces="delegatorSpaces"
      />
    </BaseBlock>
  </div>
</template>
