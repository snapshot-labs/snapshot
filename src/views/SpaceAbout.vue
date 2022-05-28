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
      <div class="px-4 md:px-0 mb-3 flex">
        <h2>{{ $t('about') }}</h2>
      </div>
      <BaseBlock class="mb-3">
        <div class="mb-3">
          <h4 class="text-skin-link mb-2">{{ $t('settings.network') }}</h4>
          <div>{{ network.name }}</div>
        </div>

        <div class="mb-3">
          <h4 class="text-skin-link mb-2">
            {{ $t('settings.proposalValidation') }}
          </h4>
          {{ space.validation?.name || 'basic' }}
        </div>

        <div
          v-if="
            (!space.validation || space.validation?.name === 'basic') &&
            space.filters?.minScore
          "
          class="last:mb-0 mb-3"
        >
          <h4 class="text-skin-link mb-2">
            {{ $t('settings.proposalThreshold') }}
          </h4>
          {{ formatCompactNumber(space.filters.minScore) }}
          {{ space.symbol }}
        </div>

        <div v-if="space.terms" class="last:mb-0 mb-3">
          <h4 class="text-skin-link mb-2">{{ $t('settings.terms') }}</h4>
          <BaseLink :link="space.terms">
            <TextAutolinker :text="getUrl(space.terms)" :truncate="35" />
          </BaseLink>
        </div>

        <div v-if="space.strategies" class="last:mb-0 mb-3">
          <h4 class="text-skin-link mb-2">{{ $t('settings.strategies') }}</h4>
          <div v-for="(strategy, i) in space.strategies" :key="i">
            <div>{{ strategy.name }}</div>
          </div>
        </div>

        <div v-if="Object.keys(space.plugins || {}).length">
          <h4 class="text-skin-link mb-2">{{ $t('plugins') }}</h4>
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
          class="px-4 py-3 border-t flex"
        >
          <AvatarUser :address="user" :profile="profiles[user]" />
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
          class="px-4 py-3 border-t flex"
        >
          <AvatarUser :address="user" :profile="profiles[user]" />
        </div>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
