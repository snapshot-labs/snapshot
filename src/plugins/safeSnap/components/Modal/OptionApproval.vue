<script>
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { useEns } from '@/composables/useEns';
import { useSafe } from '@/composables';
import { getEnsTextRecord } from '@snapshot-labs/snapshot.js/src/utils';

export default {
  props: [
    'open',
    'isApproved',
    'bond',
    'questionId',
    'minimumBond',
    'tokenSymbol',
    'tokenDecimals',
    'oracle'
  ],
  emits: ['close', 'setApproval'],
  setup() {
    const { safesnap } = useSafe();
    const { isValidEnsDomain } = useEns();
    return { safesnap, isValidEnsDomain };
  },
  data() {
    return { criteriaLink: '' };
  },
  computed: {
    answer() {
      return this.isApproved ? 'Yes' : 'No';
    },
    bondData() {
      const bondNotSet = BigNumber.from(this.bond).eq(0);
      const minimumBond = BigNumber.from(this.minimumBond).eq(0)
        ? BigNumber.from(10).pow(this.tokenDecimals)
        : this.minimumBond;
      const toSet = bondNotSet ? minimumBond : BigNumber.from(this.bond).mul(2);
      return {
        toSet: formatUnits(toSet, this.tokenDecimals),
        current: bondNotSet ? '--' : formatUnits(this.bond, this.tokenDecimals),
        tokenSymbol: this.tokenSymbol
      };
    },
    questionLink() {
      if (this.tokenSymbol && this.tokenSymbol !== 'ETH') {
        return `https://reality.eth.link/app/#!/token/${this.tokenSymbol}/question/${this.oracle}-${this.questionId}`;
      }
      return `https://reality.eth.link/app/#!/question/${this.oracle}-${this.questionId}`;
    }
  },
  mounted() {
    setTimeout(this.getCriteriaLink, 800);
  },
  methods: {
    async handleSetApproval(option) {
      await this.$emit('setApproval', option);
      this.$emit('close');
    },
    async getCriteriaLink() {
      const { spaceId } = this.safesnap.config;
      if (this.isValidEnsDomain(spaceId)) {
        try {
          this.criteriaLink = await getEnsTextRecord(
            spaceId,
            'daorequirements'
          );
        } catch (err) {
          console.warn(
            '[safesnap] failed to get the "daorequirements" text record'
          );
        }
      }
    }
  }
};
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 class="title">SafeSnap</h3>
    </template>
    <div class="m-4 mb-5">
      <p v-if="criteriaLink">
        {{ $t('safeSnap.labels.question') }}
        <a
          class="question-link"
          rel="noreferrer noopener"
          target="_blank"
          :href="criteriaLink"
        >
          {{ $t('safeSnap.labels.criteria') }}
        </a>
      </p>
      <p v-if="!criteriaLink">{{ $t('safeSnap.labels.proposalPassed') }}</p>
      <div style="text-align: right">
        <a
          :href="questionLink"
          class="text-skin-text"
          rel="noreferrer noopener"
          target="_blank"
          style="font-size: 16px"
        >
          Question
          <i style="font-size: 14px" class="iconfont iconexternal-link" />
        </a>
      </div>

      <div class="my-3 rounded-lg border p-3">
        <div>
          <b class="pr-3">{{ $t('safeSnap.currentOutcome') }}:</b>
          <span class="float-right text-skin-link">
            {{ answer }}
          </span>
        </div>
        <div>
          <b class="pr-3">{{ $t('safeSnap.currentBond') }}:</b>
          <span class="float-right text-skin-link">
            {{ bondData.current + ' ' + tokenSymbol }}
          </span>
        </div>
        <div>
          <b class="pr-3">{{ $t('safeSnap.nextBond') }}:</b>
          <span class="float-right text-skin-link">
            {{ bondData.toSet + ' ' + bondData.tokenSymbol }}
          </span>
        </div>
      </div>

      <div class="mt-5">
        <h4 class="text-center">
          {{ $t('safeSnap.setOutcomeTo') }}
        </h4>
        <div class="vote-button-row">
          <BaseButton class="button vote-button" @click="handleSetApproval(0)">
            No
          </BaseButton>
          <BaseButton class="vote-button" primary @click="handleSetApproval(1)">
            Yes
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

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
