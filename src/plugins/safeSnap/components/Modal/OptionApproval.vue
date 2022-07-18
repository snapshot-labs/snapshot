<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { useEns } from '@/composables/useEns';
import { useSafesnap } from '@/plugins/safeSnap/composables/useSafesnap';
import { getEnsTextRecord } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  open: boolean;
  isApproved: boolean;
  bond: BigNumber;
  questionId: string;
  minimumBond: string;
  tokenSymbol: string;
  tokenDecimals: number;
  oracle: string;
}>();

const emit = defineEmits(['close', 'setApproval']);

const { safesnap } = useSafesnap();
const { isValidEnsDomain } = useEns();

const handleSetApproval = async (option: any) => {
  emit('setApproval', option);
  emit('close');
};

const criteriaLink = ref('');

const getCriteriaLink = async () => {
  const { spaceId } = safesnap.value.config;
  if (isValidEnsDomain(spaceId)) {
    try {
      criteriaLink.value = await getEnsTextRecord(spaceId, 'daorequirements');
    } catch (err) {
      console.warn(
        '[safesnap] failed to get the "daorequirements" text record'
      );
    }
  }
};

const answer = computed(() => (props.isApproved ? 'Yes' : 'No'));

const bondData = computed(() => {
  const bondNotSet = BigNumber.from(props.bond).eq(0);
  const minimumBond = BigNumber.from(props.minimumBond).eq(0)
    ? BigNumber.from(10).pow(props.tokenDecimals)
    : props.minimumBond;
  const toSet = bondNotSet ? minimumBond : BigNumber.from(props.bond).mul(2);
  return {
    toSet: formatUnits(toSet, props.tokenDecimals),
    current: bondNotSet ? '--' : formatUnits(props.bond, props.tokenDecimals),
    tokenSymbol: props.tokenSymbol
  };
});

const questionLink = computed(() => {
  if (props.tokenSymbol && props.tokenSymbol !== 'ETH') {
    return `https://reality.eth.link/app/#!/token/${props.tokenSymbol}/question/${props.oracle}-${props.questionId}`;
  }
  return `https://reality.eth.link/app/#!/question/${props.oracle}-${props.questionId}`;
});

onMounted(() => {
  setTimeout(getCriteriaLink, 800);
});
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
