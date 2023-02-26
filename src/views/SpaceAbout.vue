<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace } from '@/helpers/interfaces';

import { useProfiles, useMeta } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

useMeta({
  title: {
    key: 'metaInfo.space.about.title',
    params: {
      space: props.space.name
    }
  },
  description: {
    key: 'metaInfo.space.about.description',
    params: {
      about: props.space.about.slice(0, 160)
    }
  }
});

const { profiles, loadProfiles } = useProfiles();

type Moderator = {
  id: string;
  roles: string[];
};

const spaceMembers = computed(() => {
  const authors = props.space.members.map(member => {
    return {
      id: member,
      roles: ['author']
    };
  });

  const admins = props.space.admins.map(admin => {
    return {
      id: admin,
      roles: ['admin']
    };
  });

  return authors.concat(admins).reduce<Moderator[]>((acc, curr) => {
    const existing = acc.find(member => member.id === curr.id);
    if (existing) {
      existing.roles = existing.roles.concat(curr.roles);
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as Moderator[]);
});

onMounted(() => {
  if (props.space?.admins)
    loadProfiles(props.space.admins.concat(props.space.members));
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
        v-if="space?.admins?.length"
        :title="$t('spaceMembers')"
        class="mt-3"
        slim
      >
        <AboutMembersListItem v-for="(mod, i) in spaceMembers" :key="i">
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
      </BaseBlock>
    </template>
  </TheLayout>
</template>
