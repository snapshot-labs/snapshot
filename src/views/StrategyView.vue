<script setup>
const route = useRoute();

const { getExtendedStrategy, extendedStrategy: strategy } = useStrategies();

useMeta({
  title: {
    key: 'metaInfo.strategy.title',
    params: {
      strategy: route.params.name
    }
  },
  description: {
    key: 'metaInfo.strategy.description'
  }
});

onMounted(async () => {
  await getExtendedStrategy(route.params.name);
});
</script>

<template>
  <TheLayout>
    <template #content-left>
      <div class="mb-3 px-4 md:px-0">
        <router-link
          :to="{ path: '/', query: { type: 'strategies' } }"
          class="text-skin-text"
        >
          <BaseIcon name="back" size="22" class="!align-middle" />
          {{ $t('strategiesPage') }}
        </router-link>
      </div>
      <LoadingPage v-if="!strategy" />
      <div v-else class="px-4 md:px-0">
        <h1 class="mb-2">
          {{ strategy.id }}
        </h1>
        <span
          class="text-skin-text"
          v-text="`In ${strategy.spacesCount} space(s)`"
        />
        <BaseMarkdown :body="strategy.about" class="mb-6 mt-4" />
      </div>
    </template>
    <template #sidebar-right>
      <BaseBlock v-if="strategy" :title="$t('information')">
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
          <BaseButton tabindex="-1" class="mt-2 w-full">{{
            $t('playground')
          }}</BaseButton>
        </router-link>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
