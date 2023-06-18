<script setup lang="ts">
import { Proposal, VoteFilters } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  modelValue: VoteFilters;
}>();

const emit = defineEmits(['update:modelValue']);

function updateFilters(
  key: keyof VoteFilters,
  val: VoteFilters[keyof VoteFilters]
) {
  emit('update:modelValue', { ...props.modelValue, [key]: val });
}
</script>

<template>
  <BasePopover :focus="false">
    <template #button>
      <BaseButtonIcon>
        <i-ho-funnel class="text-skin-link" />
      </BaseButtonIcon>
    </template>
    <template #content>
      <div>
        <h3 class="-mb-2 mt-3 text-center text-skin-heading">
          {{ $t('proposal.votesModal.filtersPopover.title') }}
        </h3>
        <div class="m-4 space-y-3">
          <div class="space-y-2">
            <span class="text-skin-heading">
              {{ $t('proposal.votesModal.filtersPopover.votingPower') }}
            </span>

            <TuneRadio
              value="asc"
              hint="Asc"
              :model-value="modelValue.orderDirection"
              @update:model-value="updateFilters('orderDirection', $event)"
            />
            <TuneRadio
              value="desc"
              hint="Desc"
              :model-value="modelValue.orderDirection"
              @update:model-value="updateFilters('orderDirection', $event)"
            />
          </div>
          <div class="space-y-2">
            <span class="text-skin-heading">
              {{ $t('proposal.votesModal.filtersPopover.more') }}
            </span>
            <TuneCheckbox
              :model-value="Boolean(modelValue.onlyWithReason)"
              :hint="
                $t('proposal.votesModal.filtersPopover.onlyVotesWithReason')
              "
              name="searchOnlyWithReason"
              @update:model-value="updateFilters('onlyWithReason', $event)"
            />
          </div>
        </div>
      </div>
    </template>
  </BasePopover>
</template>
