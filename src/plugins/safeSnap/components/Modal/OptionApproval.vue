<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { useEns } from '@/composables/useEns';
import { getEnsTextRecord } from '@snapshot-labs/snapshot.js/src/utils';
import { ref, computed, onMounted } from 'vue';

const props = defineProps([
  'spaceId',
  'open',
  'isApproved',
  'bond',
  'questionId',
  'minimumBond',
  'tokenSymbol',
  'tokenDecimals',
  'oracle'
]);

const emit = defineEmits(['close', 'setApproval']);

const { isValidEnsDomain } = useEns();

const criteriaLink = ref('');

const answer = computed(() => {
  return props.isApproved ? 'Yes' : 'No';
});

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

const handleSetApproval = async option => {
  emit('setApproval', option);
  emit('close');
};

const getCriteriaLink = async () => {
  if (isValidEnsDomain(props.spaceId)) {
    try {
      criteriaLink.value = await getEnsTextRecord(
        props.spaceId,
        'daorequirements'
      );
    } catch (err) {
      console.warn(
        '[safesnap] failed to get the "daorequirements" text record'
      );
    }
  }
};

onMounted(() => setTimeout(getCriteriaLink, 800));
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 class="pl-4 text-left">SafeSnap</h3>
    </template>
    <div class="m-4 mb-5">
      <p v-if="criteriaLink">
        {{ $t('safeSnap.labels.question') }}
        <a
          class="text-skin-link underline"
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
          <em style="font-size: 14px" class="iconfont iconexternal-link" />
        </a>
      </div>

      <div class="my-3 rounded-lg border p-3">
        <div>
          <strong class="pr-3">{{ $t('safeSnap.currentOutcome') }}:</strong>
          <span class="float-right text-skin-link">
            {{ answer }}
          </span>
        </div>
        <div>
          <strong class="pr-3">{{ $t('safeSnap.currentBond') }}:</strong>
          <span class="float-right text-skin-link">
            {{ bondData.current + ' ' + tokenSymbol }}
          </span>
        </div>
        <div>
          <strong class="pr-3">{{ $t('safeSnap.nextBond') }}:</strong>
          <span class="float-right text-skin-link">
            {{ bondData.toSet + ' ' + bondData.tokenSymbol }}
          </span>
        </div>
      </div>

      <div class="mt-5">
        <h4 class="text-center">
          {{ $t('safeSnap.setOutcomeTo') }}
        </h4>
        <div class="mt-3 flex space-x-3">
          <BaseButton class="grow" @click="handleSetApproval(0)">
            No
          </BaseButton>
          <BaseButton class="grow" primary @click="handleSetApproval(1)">
            Yes
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
