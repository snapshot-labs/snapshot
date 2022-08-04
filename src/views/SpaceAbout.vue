<script setup lang="ts">
import { computed, onMounted } from 'vue';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace } from '@/helpers/interfaces';
import { useProfiles, useI18n, useIntl } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const network = computed(() => networks[props.space?.network]);

const { formatCompactNumber } = useIntl();
const { setPageTitle } = useI18n();
const { profiles, loadProfiles } = useProfiles();

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
      <BaseBlock class="mb-3">
        <div class="mb-3">
          <h4 class="mb-2 text-skin-link">
            {{ $t('settings.network.label') }}
          </h4>
          <div>{{ network.name }}</div>
        </div>

        <div class="mb-3">
          <h4 class="mb-2 text-skin-link">
            {{ $t('settings.proposalValidation') }}
          </h4>
          {{ space.validation?.name || 'basic' }}
        </div>

        <div
          v-if="
            (!space.validation || space.validation?.name === 'basic') &&
            space.filters?.minScore
          "
          class="mb-3 last:mb-0"
        >
          <h4 class="mb-2 text-skin-link">
            {{ $t('settings.proposalThreshold.label') }}
          </h4>
          {{ formatCompactNumber(space.filters.minScore) }}
          {{ space.symbol }}
        </div>

        <div v-if="space.terms" class="mb-3 last:mb-0">
          <h4 class="mb-2 text-skin-link">{{ $t('settings.terms.label') }}</h4>
          <BaseLink :link="space.terms">
            <TextAutolinker :text="getUrl(space.terms)" :truncate="35" />
          </BaseLink>
        </div>

        <div v-if="space.strategies" class="mb-3 last:mb-0">
          <h4 class="mb-2 text-skin-link">
            {{ $t('settings.strategies.label') }}
          </h4>
          <div v-for="(strategy, i) in space.strategies" :key="i">
            <div>{{ strategy.name }}</div>
          </div>
        </div>

        <div v-if="Object.keys(space.plugins || {}).length">
          <h4 class="mb-2 text-skin-link">{{ $t('plugins') }}</h4>
          <div v-for="(plugin, i) in space.plugins" :key="i">
            <div>{{ i }}</div>
          </div>
        </div>
      </BaseBlock>
      <BaseBlock
        v-if="space?.admins?.length"
        :title="$t('settings.admins.label')"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.admins"
          :key="i"
          class="flex border-t px-4 py-3 first:border-t-0"
        >
          <BaseUser :address="user" :profile="profiles[user]" />
        </div>
      </BaseBlock>
      <BaseBlock
        v-if="space?.members?.length"
        :title="$t('settings.authors.label')"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.members"
          :key="i"
          class="flex border-t px-4 py-3 first:border-t-0"
        >
          <BaseUser :address="user" :profile="profiles[user]" />
        </div>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
