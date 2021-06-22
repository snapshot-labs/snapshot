<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0">
        <h1 v-text="'Test'" class="mb-4" />
      </div>
      <Block>
        <UiButton
          :loading="loadingProposal"
          @click="submitProposal"
          class="button--submit width-full mb-2"
        >
          Proposal
        </UiButton>
        <UiButton
          :loading="loadingVote"
          @click="submitVote"
          class="button--submit width-full"
        >
          Vote
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { proposal, send, vote } from '@/sign';

export default {
  setup() {
    const store = useStore();
    const auth = getInstance();

    const loadingProposal = ref(false);
    const loadingVote = ref(false);
    const web3Account = computed(() => store.state.web3.account);

    async function submitProposal() {
      loadingProposal.value = true;
      try {
        const envelop = await proposal(auth.web3, web3Account.value, {
          space: 'fabien.eth',
          timestamp: 1624139921,
          type: 'single-choice',
          title: 'This is a test!',
          body: 'Just a test.',
          choices: ['Alice', 'Bob', 'Carol'],
          start: 1623139921,
          end: 1625139921,
          snapshot: 12682785,
          metadata: JSON.stringify({})
        });
        const result = await send(envelop);
        console.log('Result', result);
        console.log('Envelop', envelop);
      } catch (e) {
        console.log(e);
      }
      loadingProposal.value = false;
    }

    async function submitVote() {
      loadingVote.value = true;
      try {
        const envelop = await vote(auth.web3, web3Account.value, {
          space: 'fabien.eth',
          timestamp: 1624139921,
          proposal:
            '0x71618aeb1a793d6af3c8e33e895a945623ba58cfb02f10119dc29263cb242572',
          choice: 1,
          metadata: JSON.stringify({})
        });
        const result = await send(envelop);
        console.log('Result', result);
        console.log('Envelop', envelop);
      } catch (e) {
        console.log(e);
      }
      loadingVote.value = false;
    }

    return { loadingProposal, loadingVote, submitProposal, submitVote };
  }
};
</script>
