<template>
  <router-link
    class="px-4 py-3 d-block text-gray"
    :to="{ name: 'proposal', params: { key: space.key, id: i } }"
  >
    <div>
      <State :proposal="proposal" class="d-inline-block mr-2 mb-2" />
      <h3
        v-text="_shorten(proposal.msg.payload.name, 'name')"
        class="d-inline-block mb-1"
      />
    </div>
    <div>
      <span v-text="`#${i.slice(0, 7)}`" />
      {{ $tc('createdBy', [_shorten(proposal.address)]) }}
      <Badges :address="proposal.address" :members="space.members" />
      {{
        $tc(period, [
          _ms(proposal.msg.payload.start),
          _ms(proposal.msg.payload.end)
        ])
      }}
    </div>
  </router-link>
</template>

<script>
import { computed } from 'vue';
export default {
  props: {
    space: Object,
    proposal: Object,
    verified: Array,
    i: String
  },
  setup(props) {
    const isVerified = computed(() => {
      return (
        Array.isArray(props.verified) &&
        props.verified.length > 0 &&
        props.verified.includes(props.proposal.address)
      );
    });

    const period = computed(() => {
      const ts = (Date.now() / 1e3).toFixed();
      const { start, end } = props.proposal.msg.payload;
      if (ts > end) return 'endedAgo';
      if (ts > start) return 'endIn';
      return 'startIn';
    });

    return { isVerified, period };
  }
};
</script>
