<template>
  <div class="px-4 px-md-0 mb-3 d-flex">
    <div class="d-flex flex-items-end flex-auto">
      <div>
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
      <TimelineProposal :proposal="proposal" />
    </Block>
  </div>
  <div style="height: 10px; width: 10px; position: absolute" id="endofpage" />
  <Block v-if="loadingMore && !loading" :slim="true">
    <RowLoading class="my-2" />
  </Block>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { apolloClient } from '@/apollo';
import { PROPOSALS_QUERY } from '@/helpers/queries';

export default {
  props: ['space'],
  setup(props) {
    const loading = ref(false);
    const proposals = ref([]);
    const filterBy = ref('all');
    const spaceMembers = computed(() =>
      props.space.members.length < 1 ? ['none'] : props.space.members
    );

    // Infinite scroll with pagination
    const {
      loadBy,
      limit,
      loadingMore,
      stopLoadingMore,
      loadMore
    } = useInfiniteLoader();

    useScrollMonitor(() =>
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
            space: props.space.id,
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

    return {
      loading,
      selectState,
      loadingMore,
      filterBy,
      proposals
    };
  }
};
</script>
