import { computed, ref } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { apolloClient } from '@/helpers/apollo';

export function useApolloQuery() {
  const loading = ref(false);

  async function apolloQuery(options, path) {
    try {
      loading.value = true;
      const response = await apolloClient.query(options);
      loading.value = false;

      return cloneDeep(!path ? response.data : response.data[path]);
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  }

  return { apolloQuery, queryLoading: computed(() => loading.value) };
}
