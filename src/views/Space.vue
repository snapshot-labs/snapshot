<template>
  <Layout>
    <template #sidebar-left>
      <BlockSpace :space="space" />
    </template>
    <template #content-right>
      <div class="px-4 px-md-0 mb-3 d-flex">
        <div class="flex-auto">
          <div v-text="space.name" />
          <div class="d-flex flex-items-center flex-auto">
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
            {{ $t(`proposals.states.${filterBy}`) }}
            <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
          </UiButton>
        </UiDropdown>
      </div>

      <Block v-if="loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>

      <NoResults :block="true" v-else-if="proposals.length < 1" />
      <div v-else>
        <Block :slim="true" v-for="(proposal, i) in proposals" :key="i">
          <TimelineProposal :proposal="proposal" :profiles="profiles" />
        </Block>
      </div>
      <div
        style="height: 10px; width: 10px; position: absolute"
        ref="endElement"
      />
      <Block v-if="loadingMore && !loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useDomain } from '@/composables/useDomain';
import { apolloClient } from '@/apollo';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { useProfiles } from '@/composables/useProfiles';

const store = useStore();
const route = useRoute();
const { domain } = useDomain();

const spaceId = domain || route.params.key;

const loading = ref(false);
const proposals = ref([]);
const filterBy = ref('all');

const space = computed(() => store.state.app.spaces[spaceId]);
const spaceMembers = computed(() =>
  space.value.members.length < 1 ? ['none'] : space.value.members
);

// Infinite scroll with pagination
const { loadBy, limit, loadingMore, stopLoadingMore, loadMore } =
  useInfiniteLoader();

const { endElement } = useScrollMonitor(() =>
  loadMore(() => loadProposals(limit.value), loading.value)
);

// Proposals query
async function loadProposals(skip = 0) {
  try {
    const response = await apolloClient.query({
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space: spaceId,
        state: filterBy.value === 'core' ? 'all' : filterBy.value,
        author_in: filterBy.value === 'core' ? spaceMembers.value : []
      }
    });
    stopLoadingMore.value = response.data.proposals?.length < loadBy;
    proposals.value = proposals.value.concat(response.data.proposals);
  } catch (e) {
    console.log(e);
  }
}

// Initialize
onMounted(load());

async function load() {
  loading.value = true;
  await loadProposals();
  loading.value = false;
}

// Change filter
function selectState(e) {
  filterBy.value = e;
  proposals.value = [];
  limit.value = loadBy;
  load();
}

const { profiles, addressArray } = useProfiles();

watch(proposals, () => {
  addressArray.value = proposals.value.map(proposal => proposal.author);
});
</script>
