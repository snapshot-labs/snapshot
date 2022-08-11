<script setup lang="ts">
import { computed, onMounted } from 'vue';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace } from '@/helpers/interfaces';
import { useProfiles, useI18n } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { setPageTitle } = useI18n();
const { profiles, loadProfiles } = useProfiles();

type Moderator = {
  id: string;
  roles: string[];
};

const moderators = computed(() => {
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
  if (props.space?.name)
    setPageTitle('page.title.space.about', { space: props.space.name });
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

      <div class="space-y-3 px-4 md:px-0">
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

      <BaseBlock
        v-if="space.strategies"
        :title="$t('settings.strategies.label')"
        class="mt-3"
        slim
      >
        <div
          v-for="(strategy, i) in space.strategies"
          :key="i"
          class="flex justify-between border-b p-4 last:border-b-0"
        >
          <div>
            <BaseLink
              :link="`https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/${strategy.name}`"
            >
              {{ strategy.name }}
            </BaseLink>
            <div>{{ networks[strategy.network].name }}</div>
          </div>
          <div>
            <BasePill v-if="strategy.params.symbol" class="py-1">
              ${{ strategy.params.symbol }}
            </BasePill>
          </div>
        </div>
      </BaseBlock>
      <BaseBlock
        v-if="space?.admins?.length"
        :title="$t('moderators')"
        class="mt-3"
        slim
      >
        <AboutModeratorsListItem v-for="(mod, i) in moderators" :key="i">
          <BaseUser :address="mod.id" :profile="profiles[mod.id]" />
          <div class="space-x-2">
            <BasePill v-if="mod.roles.includes('admin')" class="py-1">
              admin
            </BasePill>
            <BasePill v-if="mod.roles.includes('author')" class="py-1">
              author
            </BasePill>
          </div>
        </AboutModeratorsListItem>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
