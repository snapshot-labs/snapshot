<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { ModuleExecutionData } from '@/helpers/safe';
import { useExecutorReality } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposal: Proposal;
}>();

const executor = await useExecutorReality(props.executionData, props.proposal);
</script>

<template>
  <ExecutionAbstract :executor="executor">
    <template #propose>
      <BaseButton class="w-full" @click="executor.propose">
        Propose transactions for execution
      </BaseButton>
    </template>

    <template #dispute>
      <div>
        <div>Shall these transactions be executed?</div>
        <div>
          Current answer:
          {{ executor.bestAnswer ? 'Yes' : 'No' }}
        </div>
        <div>Cooldown: {{ executor.cooldown }}</div>
        <BaseButton
          v-if="!executor.bestAnswer"
          @click="executor.disputeExecution(true)"
        >
          Yes
        </BaseButton>
        <BaseButton
          v-if="executor.bestAnswer"
          @click="executor.disputeExecution(false)"
        >
          No
        </BaseButton>
        <div>Required bond: {{ executor.bondNextAmount }}</div>
      </div>
    </template>

    <template #execute>
      <div v-if="executor.cooldown">
        Waiting for cooldown: {{ executor.cooldown }}
      </div>
      <div v-else>
        <BaseButton @click="executor.execute">
          Execute transaction batch #{{ executor.nextTransactionToExecute }}
        </BaseButton>
        <BaseButton @click="executor.claimBond"> Claim bond </BaseButton>
      </div>
    </template>

    <template #executed>
      <div class="flex flex-col items-center justify-center">
        <span class="mb-3 rounded-full bg-green p-2 text-white">
          <i-ho-check />
        </span>
        <span>Transactions have been executed.</span>
        <BaseLink link="https://etherscan.io">
          Open transaction in explorer
        </BaseLink>
      </div>
    </template>

    <template #rejected>
      <div class="flex flex-col items-center justify-center">
        <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
          <i-ho-x />
        </span>
        <span>Transactions have been rejected.</span>
      </div>
    </template>
  </ExecutionAbstract>
</template>
