<script setup>
import { computed, onMounted } from 'vue';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useProfiles } from '@/composables/useProfiles';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { useI18n } from '@/composables/useI18n';
import { useIntl } from '@/composables/useIntl';

const props = defineProps({
  space: Object
});

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
          <h4 class="mb-2 text-skin-link">{{ $t('settings.network') }}</h4>
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
            {{ $t('settings.proposalThreshold') }}
          </h4>
          {{ formatCompactNumber(space.filters.minScore) }}
          {{ space.symbol }}
        </div>

        <div v-if="space.terms" class="mb-3 last:mb-0">
          <h4 class="mb-2 text-skin-link">{{ $t('settings.terms') }}</h4>
          <BaseLink :link="space.terms">
            <TextAutolinker :text="getUrl(space.terms)" :truncate="35" />
          </BaseLink>
        </div>

        <div v-if="space.strategies" class="mb-3 last:mb-0">
          <h4 class="mb-2 text-skin-link">{{ $t('settings.strategies') }}</h4>
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
        :title="$t('settings.admins')"
        v-if="space?.admins?.length"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.admins"
          :key="i"
          :style="i === 0 && 'border: 0 !important;'"
          class="flex border-t px-4 py-3"
        >
          <BaseUser :address="user" :profile="profiles[user]" />
        </div>
      </BaseBlock>
      <BaseBlock
        :title="$t('settings.authors')"
        v-if="space?.members?.length"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.members"
          :key="i"
          :style="i === 0 && 'border: 0 !important;'"
          class="flex border-t px-4 py-3"
        >
          <BaseUser :address="user" :profile="profiles[user]" />
        </div>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
