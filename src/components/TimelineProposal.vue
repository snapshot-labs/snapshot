<template>
  <router-link
    class="p-4 d-block text-gray"
    :to="{
      name: 'proposal',
      params: { key: proposal.space.id, id: proposal.id }
    }"
  >
    <div>
      <div class="mb-2">
        <div class="d-flex flex-justify-between">
          <div class="d-flex flex-items-center">
            <Token :space="proposal.space" size="28" />
            <span class="ml-2" v-text="proposal.space.name" />
            &nbsp;{{ $t('proposalBy') }}
            <User
              class="ml-1"
              :hideAvatar="true"
              :address="proposal.author"
              :profile="profiles[proposal.author]"
            />
            <Badges
              :address="proposal.author"
              :members="proposal.space.members"
            />
          </div>

          <UiState :state="proposal.state" class="d-inline-block float-right" />
        </div>
      </div>
      <h3 v-text="_shorten(proposal.title, 124)" class="mt-1" />
      <p
        v-text="_shorten(body, 140)"
        class="break-word mb-1"
        style="font-size: 20px"
      />
      <div class="mt-1">
        {{ $tc(period, [_ms(proposal.start), _ms(proposal.end)]) }}
      </div>
    </div>
  </router-link>
</template>

<script>
import removeMd from 'remove-markdown';

export default {
  props: {
    proposal: Object,
    profiles: Object
  },
  computed: {
    body() {
      return removeMd(this.proposal.body);
    },
    period() {
      if (this.proposal.state === 'closed') return 'endedAgo';
      if (this.proposal.state === 'active') return 'endIn';
      return 'startIn';
    }
  }
};
</script>
