<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace, Member } from '@/helpers/interfaces';

import { useProfiles, useI18n, useFollowSpace } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const isMembersModalOpen = ref(false);

const { setPageTitle } = useI18n();
const { profiles, loadProfiles } = useProfiles();

const { spaceFollowers, isLoadingSpaceFollowers, loadSpaceFollowers } =
  useFollowSpace(props.space.id);

const spaceMembers = computed(() => {
  const followers = spaceFollowers.value.map(f => ({
    id: f.follower,
    roles: ['follower' as const]
  }));

  const authors = props.space.members.map(member => {
    return {
      id: member,
      roles: ['author' as const]
    };
  });

  const admins = props.space.admins.map(admin => {
    return {
      id: admin,
      roles: ['admin' as const]
    };
  });

  const members = [...followers, ...authors, ...admins];

  const membersWithMergedRoles = members.reduce<Member[]>((acc, curr) => {
    const existing = acc.find(member => member.id === curr.id);
    if (existing) {
      existing.roles = existing.roles.concat(curr.roles);
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Sort members by roles, admins first, authors second, followers last
  return membersWithMergedRoles
    .sort(m => {
      if (m.roles.includes('author')) return -1;
      return 0;
    })
    .sort(m => {
      if (m.roles.includes('admin')) return -1;
      return 0;
    })
    .sort(m => {
      if (m.roles.includes('admin') && m.roles.includes('author')) return -1;
      return 0;
    });
});

onMounted(async () => {
  setPageTitle('page.title.space.about', { space: props.space.name });

  await loadSpaceFollowers();

  loadProfiles(spaceMembers.value.map(member => member.id));
});
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <div class="mb-3 flex px-4 md:px-0">
        <h2>{{ $t('about') }}</h2>
      </div>

      <BaseBlock v-if="space.about || space.terms">
        <div class="space-y-3">
          <div v-if="space.about">
            <TextAutolinker :text="space.about" />
          </div>
          <div v-if="space.terms">
            <h4 class="mb-1 text-skin-link">
              {{ $t('settings.terms.label') }}
            </h4>

            <BaseLink
              :link="getUrl(space.terms)"
              class="flex items-center text-skin-text hover:text-skin-link"
            >
              <div class="max-w-[300px] truncate">
                {{ space.terms }}
              </div>
            </BaseLink>
          </div>
        </div>
      </BaseBlock>

      <BaseBlock
        v-if="space.strategies"
        :title="$t('settings.strategies.label')"
        class="mt-3"
        slim
      >
        <SpaceAboutStrategiesList :strategies="space.strategies" />
      </BaseBlock>

      <BaseBlock
        :title="$t('spaceMembers')"
        :loading="isLoadingSpaceFollowers"
        class="mt-3"
        slim
      >
        <AboutMembersListItem
          v-for="(mod, i) in spaceMembers.slice(0, 5)"
          :key="i"
        >
          <BaseUser :address="mod.id" :profile="profiles[mod.id]" />
          <div class="space-x-2">
            <BasePill
              v-if="mod.roles.includes('admin')"
              v-tippy="{ content: $t('settings.admins.information') }"
              class="cursor-help py-1"
            >
              admin
            </BasePill>
            <BasePill
              v-if="mod.roles.includes('author')"
              v-tippy="{ content: $t('settings.authors.information') }"
              class="cursor-help py-1"
            >
              author
            </BasePill>
          </div>
        </AboutMembersListItem>
        <a
          v-if="spaceMembers.length > 5"
          class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
          @click="isMembersModalOpen = true"
        >
          <span v-text="$t('seeMore')" />
        </a>
      </BaseBlock>
    </template>
  </TheLayout>
  <Teleport to="#modal">
    <ModalMembers
      :open="isMembersModalOpen"
      :space-members="spaceMembers"
      :profiles="profiles"
      @close="isMembersModalOpen = false"
    />
  </Teleport>
</template>
