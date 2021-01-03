<template>
  <div>
    <Container :slim="true">
      <div>
        <div class="col-12 col-lg-3 float-left hide-sm hide-md hide-lg">
          <Block title="Menu" />
        </div>
        <div class="col-12 col-lg-9 float-left pl-0 pl-lg-5">
          <div class="px-4 px-md-0 mb-3 d-flex">
            <div class="flex-auto">
              <router-link :to="{ name: 'home' }" class="text-gray">
                <Icon name="back" size="22" class="v-align-middle" />
                Home
              </router-link>
              <div class="d-flex flex-items-center flex-auto">
                <h2>Timeline</h2>
              </div>
            </div>
            <UiButton>
              <Icon size="24" name="gear" class="mr-n4 ml-n4 mt-n1 d-block" />
            </UiButton>
          </div>
          <Block v-if="loading" :slim="true">
            <RowLoading />
          </Block>
          <div v-if="loaded">
            <Block :slim="true" v-for="(proposal, i) in proposals" :key="i">
              <TimelineProposal
                :proposal="proposal"
                :space="app.spaces[proposal.msg.space]"
                :i="i"
              />
            </Block>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script>
import client from '@/helpers/client';
import { formatProposals } from '@/helpers/utils';

export default {
  data() {
    return {
      loading: false,
      loaded: false,
      proposals: {}
    };
  },
  async created() {
    this.loading = true;
    try {
      const proposals = await client.request('timeline');
      this.proposals = formatProposals(proposals);
    } catch (e) {
      console.log(e);
    }
    this.loading = false;
    this.loaded = true;
  }
};
</script>
