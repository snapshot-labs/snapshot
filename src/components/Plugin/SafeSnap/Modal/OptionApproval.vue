<script>
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { ensTextRecord } from '../../../../helpers/profile';
import { useEns } from '@/composables/useEns';
import { useSafesnap } from '@/composables/useSafesnap';
import { useDebounce } from '@/composables/useDebounce';

export default {
  props: [
    'open',
    'isApproved',
    'bond',
    'questionId',
    'minimumBond',
    'tokenSymbol',
    'tokenDecimals'
  ],
  emits: ['close', 'setApproval'],
  setup() {
    const { safesnap } = useSafesnap();
    const { isValidEnsDomain } = useEns();
    const debounce = useDebounce();
    return { safesnap, debounce, isValidEnsDomain };
  },
  data() {
    return { criteriaLink: '' };
  },
  mounted() {
    this.debounce(this.getCriteriaLink);
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
          this.criteriaLink = await ensTextRecord(spaceId, 'daorequirements');
          console.log('criteria', this.criteriaLink);
        } catch (err) {
          console.warn(
            '[safesnap] failed to get the "daorequirements" text record'
          );
        }
      }
    }
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
    }
  }
};
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 class="title">SafeSnap</h3>
    </template>
    <div class="m-4 mb-5">
      <p>
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

      <div class="border rounded-lg p-3 my-3">
        <div>
          <b class="pr-3">{{ $t('safeSnap.currentOutcome') }}:</b>
          <span class="float-right link-color">
            {{ answer }}
          </span>
        </div>
        <div>
          <b class="pr-3">{{ $t('safeSnap.currentBond') }}:</b>
          <span class="float-right link-color">
            {{ bondData.current + ' ' + tokenSymbol }}
          </span>
        </div>
        <div>
          <b class="pr-3">{{ $t('safeSnap.nextBond') }}:</b>
          <span class="float-right link-color">
            {{ bondData.toSet + ' ' + bondData.tokenSymbol }}
          </span>
        </div>
      </div>

      <div class="mt-5">
        <h4 class="text-center">
          {{ $t('safeSnap.setOutcomeTo') }}
        </h4>
        <div class="vote-button-row">
          <UiButton @click="handleSetApproval(0)" class="button vote-button">
            No
          </UiButton>
          <UiButton @click="handleSetApproval(1)" class="vote-button" primary>
            Yes
          </UiButton>
        </div>
      </div>
    </div>
  </UiModal>
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
