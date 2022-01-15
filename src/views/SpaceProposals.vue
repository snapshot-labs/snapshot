<script setup>
import { watchEffect } from 'vue';
import { useStore } from '@/composables/useStore';
import { setPageTitle } from '@/helpers/utils';

const props = defineProps({ space: Object, spaceId: String });

const { store } = useStore();

function selectState(e) {
  store.space.filterBy = e;
  store.space.proposals = [];
}

watchEffect(() => {
  if (props.space?.name)
    setPageTitle('page.title.space.proposals', { space: props.space.name });
});
</script>

<template>
  <Layout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" :spaceId="spaceId" />
    </template>
    <template #content-right>
      <div class="px-4 md:px-0 mb-3 flex">
        <div class="flex-auto">
          <div class="flex items-center flex-auto">
            <h2>{{ $t('proposals.header') }}</h2>
          </div>
        </div>
        <UiDropdown
          top="3.5rem"
          right="1.25rem"
          @select="selectState"
          :items="[
            { text: $t('proposals.states.all'), action: 'all' },
            { text: $t('proposals.states.active'), action: 'active' },
            { text: $t('proposals.states.pending'), action: 'pending' },
            { text: $t('proposals.states.closed'), action: 'closed' },
            { text: $t('proposals.states.core'), action: 'core' }
          ]"
        >
          <UiButton class="pr-3">
            {{ $t(`proposals.states.${store.space.filterBy}`) }}
            <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
          </UiButton>
        </UiDropdown>
      </div>
      <SpaceProposalsContent v-if="space" :space="space" :spaceId="spaceId" />
      <Block v-else :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>
