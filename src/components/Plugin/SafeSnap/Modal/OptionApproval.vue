<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 class="title">SafeSnap</h3>
    </template>
    <div class="m-4 mb-5">
      <h3>
        {{ $t('safeSnap.labels.question') }}
        <a
          class="question-link"
          rel="noreferrer noopener"
          target="_blank"
          :href="questionLink"
        >
          {{ $t('safeSnap.labels.criteria') }}
        </a>
      </h3>
      <div class="m-4 text-center">
        <h4>
          {{ $t('safeSnap.currentOutcome', [answer]) }}
        </h4>
        <br />
        <h4>
          {{ $t('safeSnap.currentBond', [bondData.current + ' ETH']) }}
        </h4>
        <br />
        <h4>
          {{ $t('safeSnap.nextBond', [bondData.toSet + ' ETH']) }}
        </h4>
      </div>
      <div>
        <h4 class="text-center">
          {{ $t('safeSnap.setOutcomeTo') }}
        </h4>
        <div class="vote-button-row">
          <UiButton @click="handleSetApproval(0)" class="button vote-button">
            No
          </UiButton>
          <UiButton
            @click="handleSetApproval(1)"
            class="button--submit vote-button"
          >
            Yes
          </UiButton>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script>
import { BigNumber } from '@ethersproject/bignumber';
export default {
  props: ['open', 'isApproved', 'bond', 'questionId', 'minimumBond'],
  emits: ['close', 'setApproval'],
  methods: {
    async handleSetApproval(option) {
      await this.$emit('setApproval', option);
      this.$emit('close');
    }
  },
  computed: {
    answer() {
      return this.isApproved ? 'Yes' : 'No';
    },
    bondData() {
      const dontHasBond = this.bond === '0.0';
      const minimumBond = BigNumber.from(this.minimumBond).eq(0)
        ? 0.001
        : this.minimumBond;
      return {
        toSet: dontHasBond ? minimumBond : BigNumber.from(this.bond).mul(2),
        current: dontHasBond ? '--' : this.bond
      };
    },
    questionLink() {
      return 'https://reality.eth.link/app/#!/question/' + this.questionId;
    }
  }
};
</script>

<style>
.vote-button {
  width: 187px;
}
.vote-button-row {
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
}
.title {
  text-align: left;
  padding-left: 20px;
}
.question-link {
  color: var(--link-color);
  text-decoration: underline;
}
</style>
