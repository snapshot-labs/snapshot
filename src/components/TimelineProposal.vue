<template>
  <router-link
    class="px-4 py-3 pt-4 d-block text-gray"
    :to="{
      name: 'proposal',
      params: { key: proposal.space.id, id: proposal.id }
    }"
  >
    <div>
      <div class="mb-1">
        <Token :space="proposal.space.id" symbolIndex="space" size="28" />
        <span class="ml-2" v-text="proposal.space.name" />
      </div>
      <h3 v-text="_shorten(proposal.name, 124)" />
      <div class="mb-2">
        <UiState :state="proposal.state" class="d-inline-block mr-1" />
        {{ $tc('proposalBy', [author]) }}
        <Badges
          :address="proposal.author.address"
          :members="proposal.space.members"
        />
        {{ $tc(period, [_ms(proposal.start), _ms(proposal.end)]) }}
      </div>
      <p v-text="_shorten(body, 140)" class="break-word" style="font-size: 20px;" />
    </div>
  </router-link>
</template>

<script>
import removeMd from 'remove-markdown';

export default {
  props: {
    proposal: Object
  },
  computed: {
    body() {
      return removeMd(this.proposal.body);
    },
    period() {
      if (this.proposal.state === 'closed') return 'endedAgo';
      if (this.proposal.state === 'active') return 'endIn';
      return 'startIn';
    },
    author() {
      return (
        this.proposal.author.profile?.name ||
        this.proposal.author.profile?.ens ||
        this._shorten(this.proposal.author.address)
      );
    }
  }
};
</script>
