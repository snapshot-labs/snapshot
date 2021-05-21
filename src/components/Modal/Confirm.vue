<template>
  <UiModal :open="open" v-if="open" @close="$emit('close')" class="d-flex">
    <template v-slot:header>
      <h3>{{ $t('confirmVote') }}</h3>
    </template>
    <div class="d-flex flex-column flex-auto">
      <h4 class="m-4 mb-0 text-center">
        {{ $tc('sureToVote', [formatChoices]) }}
        <br />
        {{ $t('cannotBeUndone') }}
      </h4>
      <div class="m-4 p-4 border rounded-2 text-white">
        <div class="d-flex">
          <span v-text="$t('options')" class="flex-auto text-gray mr-1" />
          <div class="text-right">{{ formatChoices }}</div>
        </div>
        <div class="d-flex">
          <span v-text="$t('snapshot')" class="flex-auto text-gray mr-1" />
          <a
            :href="_explorer(space.network, proposal.snapshot, 'block')"
            target="_blank"
            class="float-right"
          >
            {{ _n(proposal.snapshot, '0,0') }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
        <div class="d-flex">
          <span v-text="$t('votingPower')" class="flex-auto text-gray mr-1" />
          <span
            class="tooltipped tooltipped-nw"
            :aria-label="
              scores
                .map((score, index) => `${_n(score)} ${symbols[index]}`)
                .join(' + ')
            "
          >
            {{ _n(totalScore) }}
            {{ _shorten(space.symbol, 'symbol') }}
          </span>
          <a
            v-if="totalScore === 0"
            target="_blank"
            href="https://docs.snapshot.org/faq#why-i-cant-vote"
            class="d-inline-block mt-n1 ml-1"
          >
            <Icon name="info" size="24" class="text-gray" />
          </a>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <div class="col-6 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="width-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="col-6 float-left pl-2">
        <UiButton
          :disabled="totalScore === 0 || loading"
          :loading="loading"
          @click="handleSubmit"
          type="submit"
          class="width-full button--submit"
        >
          {{ $t('proposal.vote') }}
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
    'selectedChoices',
    'snapshot',
    'totalScore',
    'scores',
    'strategies'
  ],
  emits: ['reload', 'close'],
  data() {
    return {
      loading: false
    };
  },
  computed: {
    symbols() {
      return this.strategies.map(strategy => strategy.params.symbol);
    },
    formatChoices() {
      if (this.proposal.type === 'approval') {
        return this.proposal.choices
          .filter(choice =>
            this.selectedChoices.includes(
              this.proposal.choices.indexOf(choice) + 1
            )
          )
          .map(choice => this._shorten(choice, 24))
          .join(', ');
      }
      if (this.proposal.type === 'single-choice')
        return this.proposal.choices[this.selectedChoices - 1];
      else return '-';
    }
  },
  methods: {
    ...mapActions(['send']),
    async handleSubmit() {
      this.loading = true;
      await this.send({
        space: this.space.key,
        type: this.proposal.type,
        payload: {
          proposal: this.id,
          choice: this.selectedChoices,
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
