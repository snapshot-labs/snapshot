<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useEns, useExtendedSpaces, useFollowSpace } from '@/composables';

const props = defineProps<{
  userAddress: string;
  profile?: { about?: string };
}>();

const { followingSpaces, loadingFollows, loadFollows } = useFollowSpace();

onMounted(() => loadFollows());

const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { loadExtentedSpaces, extentedSpaces } = useExtendedSpaces();

const domainsWithExistingSpace = computed(() => {
  const spaces = ownedEnsDomains.value.map(d => d.name);
  return extentedSpaces.value.filter(d => spaces.includes(d.id));
});

const loadingOwnedSpaces = ref(false);

onMounted(async () => {
  loadingOwnedSpaces.value = true;
  await loadOwnedEnsDomains(props.userAddress);
  await loadExtentedSpaces(ownedEnsDomains.value.map(d => d.name));
  loadingOwnedSpaces.value = false;
});
</script>

<template>
  <div>
    <div class="space-y-4">
      <ProfileAboutBiography v-if="profile?.about" :about="profile.about" />
      <BlockSpacesList
        :spaces="domainsWithExistingSpace.map(f => f.id)"
        :title="$t('profile.about.createdSpaces')"
        :message="$t('profile.about.notCreatedSpacesYet')"
        :loading="loadingOwnedSpaces"
      />

      <BlockSpacesList
        :spaces="followingSpaces"
        :title="$t('profile.about.joinedSpaces')"
        :message="$t('profile.about.notJoinSpacesYet')"
        :loading="loadingFollows"
      />

      <ProfileAboutDelegate
        :user-address="userAddress"
        :following-spaces="followingSpaces"
        :loading-followed-spaces="loadingFollows"
      />
    </div>
  </div>
</template>
