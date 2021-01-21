<template>
  <div>
    <Container :slim="true">
      <div>
        <div class="col-lg-3 float-left hide-sm hide-md hide-lg">
          <Sticky name="sidebar">
            <Block title="Menu" style="max-height: 84vh; overflow: scroll;">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Blanditiis iusto, distinctio nulla, repellendus ut neque aperiam
              debitis tempora pariatur at inventore, atque non eius? Odio ad
              repellat tenetur aliquam atque? Lorem ipsum dolor sit, amet
              consectetur adipisicing elit. Dolorum laborum sequi dicta, nam in
              sed possimus sapiente impedit pariatur doloribus aliquam, velit,
              veniam iure corporis facere? Debitis repellat molestiae
              laudantium? Lorem ipsum dolor sit amet consectetur adipisicing
              elit. Saepe animi corporis corrupti amet vel reprehenderit fuga,
              quaerat quos at dolore ut dolores? Porro necessitatibus fugiat
              ipsa perferendis, sequi atque esse!
            </Block>
          </Sticky>
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
