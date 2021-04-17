<template>
  <router-link
    class="px-4 py-3 d-block text-gray"
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
      <div class="mb-1">
        {{ $tc('proposalBy', [_shorten(proposal.author)]) }}
        <Badges :address="proposal.author" :members="proposal.space.members" />
        {{ $tc(period, [_ms(proposal.start), _ms(proposal.end)]) }}
      </div>
      <UiState :state="proposal.state" class="mb-2" />
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    proposal: Object
  },
  computed: {
    period() {
      if (this.proposal.state === 'closed') return 'endedAgo';
      if (this.proposal.state === 'active') return 'endIn';
      return 'startIn';
    }
  }
};
</script>
