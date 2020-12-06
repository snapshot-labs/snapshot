<template>
  <Block title="Quorum">
    <div>
      <div class="text-white mb-1">
        <span class="mr-1 tooltipped tooltipped-n">
          Quorum result
        </span>
        <span class="float-right" v-text="$n(0, 'percent')" />
      </div>
      <UiProgress :value="0" :max="totalSupply" class="mb-3" />
    </div>
  </Block>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Quorum',
  props: ['id', 'space', 'payload', 'results', 'votes'],
  data() {
    return {
      loading: false
    };
  },
  computed: {
    totalSupply() {
      return this.payload.totalSupply;
    },
    quorum() {
      return this.payload.quorum;
    }
  },
  methods: {
    ...mapActions(['notify'])
  },
  mounted() {
    // console.log(this.results);
  }
};
</script>
