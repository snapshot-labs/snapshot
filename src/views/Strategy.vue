<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@/composables/useI18n';
import { useStrategies } from '@/composables/useStrategies';

const route = useRoute();
const { setPageTitle } = useI18n();
const { getExtendedStrategy, extendedStrategy: strategy } = useStrategies();

onMounted(async () => {
  setPageTitle('page.title.strategy', { key: route.params.name });
  getExtendedStrategy(route.params.name);
});
</script>

<template>
  <TheLayout>
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link :to="{ path: '/strategies' }" class="text-skin-text">
          <BaseIcon name="back" size="22" class="!align-middle" />
          {{ $t('strategiesPage') }}
        </router-link>
      </div>
      <LoadingPage v-if="!strategy" />
      <div class="px-4 md:px-0" v-else>
        <h1 class="mb-2">
          {{ strategy.id }}
        </h1>
        <span
          v-text="`In ${strategy.spacesCount} space(s)`"
          class="text-skin-text"
        />
        <UiMarkdown :body="strategy.about" class="mb-6 mt-4" />
      </div>
    </template>
    <template #sidebar-right>
      <BaseBlock :title="$t('information')" v-if="strategy">
        <div class="mb-1">
          <b>{{ $t('author') }}</b>
          <BaseLink
            class="float-right"
            :link="`https://github.com/${strategy.author}`"
            hide-external-icon
          >
            <BaseIcon name="github" class="ml-1" />
            {{ strategy.author }}
          </BaseLink>
        </div>
        <div>
          <div class="mb-1">
            <b>{{ $t('version') }}</b>
            <BaseLink
              class="float-right"
              :link="`https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/${strategy.id}`"
            >
              {{ strategy.version }}
            </BaseLink>
          </div>
        </div>
        <router-link :to="`/playground/${$route.params.name}`">
          <BaseButton class="w-full mt-2">{{ $t('playground') }}</BaseButton>
        </router-link>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
