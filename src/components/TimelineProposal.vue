<template>
  <router-link
    class="px-4 py-3 d-block text-gray"
    :to="{ name: 'proposal', params: { key: space.key, id: i } }"
  >
    <div>
      <div class="mb-1">
        <Token :space="space.key" symbolIndex="space" size="28" />
        <span class="ml-2" v-text="space.name" />
      </div>
      <h3 v-text="_shorten(proposal.msg.payload.name, 52)" />
      <div class="mb-1">
        {{ $tc('proposalBy', [_shorten(proposal.address)]) }}
        <Badges :address="proposal.address" :space="space" />
        {{
          $tc(period, [
            _ms(proposal.msg.payload.start),
            _ms(proposal.msg.payload.end)
          ])
        }}
      </div>
      <State :proposal="proposal" class="mb-2" />
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    space: Object,
    proposal: Object,
    i: String
  },
  computed: {
    period() {
      const ts = (Date.now() / 1e3).toFixed();
      const { start, end } = this.proposal.msg.payload;
      if (ts > end) return 'endedAgo';
      if (ts > start) return 'endIn';
      return 'startIn';
    }
  }
};
</script>
