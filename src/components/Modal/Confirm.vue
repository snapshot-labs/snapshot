<template>
  <UiModal :open="open" v-if="open" @close="$emit('close')" class="d-flex">
    <template slot="header">
      <h3>Confirm vote</h3>
    </template>
    <div class="d-flex flex-column flex-auto">
      <h4 class="m-4 mb-0 text-center">
        Are you sure you want to vote "{{
          proposal.msg.payload.choices[selectedChoice - 1]
        }}"? <br />This action <b>cannot</b> be undone.
      </h4>
      <div class="m-4 p-4 border rounded-2 text-white">
        <div class="d-flex">
          <span v-text="'Option'" class="flex-auto text-gray mr-1" />
          {{ proposal.msg.payload.choices[selectedChoice - 1] }}
        </div>
        <div class="d-flex">
          <span v-text="'Snapshot'" class="flex-auto text-gray mr-1" />
          <a
            :href="
              _explorer(space.network, proposal.msg.payload.snapshot, 'block')
            "
            target="_blank"
            class="float-right"
          >
            {{ $n(proposal.msg.payload.snapshot) }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
        <div class="d-flex">
          <span v-text="'Your voting power'" class="flex-auto text-gray mr-1" />
          <span
            class="tooltipped tooltipped-nw"
            :aria-label="
              scores
                .map((score, index) => `${_numeral(score)} ${symbols[index]}`)
                .join(' + ')
            "
          >
            {{ _numeral(scores.reduce((a, b) => a + b, 0)) }}
            {{ _shorten(space.symbol, 'symbol') }}
          </span>
        </div>
      </div>
    </div>
    <template slot="footer">
      <div class="col-6 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="width-full">
          Cancel
        </UiButton>
      </div>
      <div class="col-6 float-left pl-2">
        <UiButton
          :disabled="loading"
          :loading="loading"
          @click="handleSubmit"
          type="submit"
          class="width-full button--submit"
        >
          Vote
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: [
    'open',
    'space',
    'proposal',
    'id',
    'selectedChoice',
    'snapshot',
    'totalScore',
    'scores'
  ],
  data() {
    return {
      loading: false
    };
  },
  computed: {
    symbols() {
      return this.space.strategies.map(strategy => strategy.params.symbol);
    }
  },
  methods: {
    ...mapActions(['send']),
    async handleSubmit() {
      this.loading = true;
      await this.send({
        space: this.space.key,
        type: 'vote',
        payload: {
          proposal: this.id,
          choice: this.selectedChoice,
          metadata: {}
        }
      });
      this.$emit('reload');
      this.$emit('close');
      this.loading = false;
    }
  }
};
</script>
