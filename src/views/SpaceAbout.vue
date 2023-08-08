<script setup lang="ts">
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace } from '@/helpers/interfaces';

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

const isModalStrategiesOpen = ref(false);

const spaceMembers = computed(() => {
  const authors = props.space.members.map(member => {
    return {
      id: member,
      roles: ['author']
    };
  });

  const moderators = props.space.moderators.map(moderator => {
    return {
      id: moderator,
      roles: ['moderator']
    };
  });

  const admins = props.space.admins.map(admin => {
    return {
      id: admin,
      roles: ['admin']
    };
  });

  return authors
    .concat(moderators)
    .concat(admins)
    .reduce<Moderator[]>((acc, curr) => {
      const existing = acc.find(member => member.id === curr.id);
      if (existing) {
        if (curr.roles[0] === 'admin') {
          existing.roles = curr.roles;
        }
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as Moderator[]);
});

onMounted(() => {
  loadProfiles(spaceMembers.value.map(member => member.id));
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <h1 class="hidden lg:mb-3 lg:block">
        {{ $t('about') }}
      </h1>

      <div class="space-y-3">
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
          :counter="space.strategies.length"
          :show-more-button="space.strategies.length > 2"
          show-more-button-label="seeAll"
          slim
          @show-more="isModalStrategiesOpen = true"
        >
          <div class="grid grid-cols-1 gap-0 px-0 md:gap-4 md:p-4 md:px-4">
            <StrategiesListItem
              v-for="(strategy, i) in space.strategies.slice(0, 2)"
              :key="i"
              :strategy="strategy"
              class="!mb-0 !border-t-0 last:border-b-0 md:!border-b md:!border-t"
            />
          </div>
        </BaseBlock>

        <BaseBlock
          v-if="spaceMembers.length"
          :title="$t('spaceMembers')"
          :counter="spaceMembers.length"
          slim
        >
          <AboutMembersListItem v-for="(mod, i) in spaceMembers" :key="i">
            <BaseUser :address="mod.id" :profile="profiles[mod.id]" />
            <div class="space-x-2">
              <BasePill
                v-if="mod.roles.includes('admin')"
                v-tippy="{ content: $t('settings.members.admin.description') }"
                class="cursor-help py-1"
              >
                admin
              </BasePill>
              <BasePill
                v-if="mod.roles.includes('moderator')"
                v-tippy="{
                  content: $t('settings.members.moderator.description')
                }"
                class="cursor-help py-1"
              >
                moderator
              </BasePill>
              <BasePill
                v-if="mod.roles.includes('author')"
                v-tippy="{ content: $t('settings.members.author.description') }"
                class="cursor-help py-1"
              >
                author
              </BasePill>
            </div>
          </AboutMembersListItem>
        </BaseBlock>
      </div>
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalStrategies
      :open="isModalStrategiesOpen"
      :strategies="space.strategies"
      @close="isModalStrategiesOpen = false"
    />
  </teleport>
</template>
