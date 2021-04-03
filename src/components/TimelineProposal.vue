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
        {{ $tc('endDate', [$d(proposal.msg.payload.end * 1e3)]) }}
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
  }
};
</script>
