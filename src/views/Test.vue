<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0">
        <h1 v-text="'Test'" class="mb-4" />
      </div>
      <Block>
        <UiButton @click="submit" class="button--submit width-full">
          {{ $t('submit') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>

<script>
import gql from 'graphql-tag';
import { signMessage } from '@/sign';
import { computed } from 'vue';
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { apolloClient } from '@/helpers/highlight';

export default {
  setup() {
    const store = useStore();
    const web3Account = computed(() => store.state.web3.account);
    const auth = getInstance();

    async function submit() {
      try {
        const unit = await signMessage(auth.web3, web3Account.value, {
          space: 'fabien.eth',
          type: 'post',
          payload: 'Hi!'
        });
        const result = await apolloClient.mutate({
          mutation: gql`
            mutation($unit: String!) {
              send(msg: $unit)
            }
          `,
          variables: {
            unit: JSON.stringify(unit)
          }
        });
        console.log('Result', result);
        console.log('Unit', unit);
      } catch (e) {
        console.log(e);
      }
    }
    return { submit };
  }
};
</script>
