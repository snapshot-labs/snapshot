<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { useProfiles } from '@/composables/useProfiles';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { useApp } from '@/composables/useApp';

const route = useRoute();
const { spaces } = useApp();

const space = computed(() => spaces.value[route.params.key]);
const network = computed(() => networks[space.value.network]);

const { profiles, addressArray } = useProfiles();

onMounted(() => {
  addressArray.value = space.value.admins.concat(space.value.members);
});
</script>

<template>
  <Layout>
    <template #sidebar-left>
      <BlockSpace :space="space" />
    </template>
    <template #content-right>
      <div class="px-4 px-md-0 mb-3 d-flex">
        <h2>{{ space.name }}</h2>
      </div>
      <Block>
        <div v-if="space.about" class="mb-3">
          <h4 class="link-color mb-2">{{ $t('settings.about') }}</h4>
          <UiText :text="space.about" />
        </div>

        <div class="mb-3">
          <h4 class="link-color mb-2">{{ $t('settings.network') }}</h4>
          <div>{{ network.name }}</div>
        </div>

        <div class="mb-3">
          <h4 class="link-color mb-2">
            {{ $t('settings.proposalValidation') }}
          </h4>
          {{ space.validation?.name || 'basic' }}
        </div>

        <div
          v-if="
            (!space.validation || space.validation?.name === 'basic') &&
            space.filters?.minScore
          "
          class="mb-3"
        >
          <h4 class="link-color mb-2">
            {{ $t('settings.proposalThreshold') }}
          </h4>
          {{ _n(space.filters.minScore) }} {{ space.symbol }}
        </div>

        <div v-if="space.terms" class="mb-3">
          <h4 class="link-color mb-2">{{ $t('settings.terms') }}</h4>
          <a :href="space.terms" target="_blank" rel="noopener noreferrer">
            <UiText :text="getUrl(space.terms)" :truncate="35" />
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>

        <div v-if="space.strategies" class="mb-3">
          <h4 class="link-color mb-2">{{ $t('settings.strategies') }}</h4>
          <div v-for="(strategy, i) in space.strategies" :key="i">
            <div>{{ strategy.name }}</div>
          </div>
        </div>

        <div v-if="Object.keys(space.plugins || {}).length" class="mb-3">
          <h4 class="link-color mb-2">{{ $t('plugins') }}</h4>
          <div v-for="(plugin, i) in space.plugins" :key="i">
            <div>{{ i }}</div>
          </div>
        </div>
      </Block>
      <Block
        :title="$t('settings.admins')"
        v-if="space.admins?.length"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.admins"
          :key="i"
          :style="i === 0 && 'border: 0 !important;'"
          class="px-4 py-3 border-top d-flex"
        >
          <User :address="user" :profile="profiles[user]" />
        </div>
      </Block>
      <Block
        :title="$t('settings.members')"
        v-if="space.members?.length"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.members"
          :key="i"
          :style="i === 0 && 'border: 0 !important;'"
          class="px-4 py-3 border-top d-flex"
        >
          <User :address="user" :profile="profiles[user]" />
        </div>
      </Block>
    </template>
  </Layout>
</template>
