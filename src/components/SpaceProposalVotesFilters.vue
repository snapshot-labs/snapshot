<script setup lang="ts">
import { Proposal, VoteFilters } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  modelValue: VoteFilters;
}>();

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const orderByOptions = computed(() => {
  return [
    { value: 'vp', title: t('searchVotingPower') },
    { value: 'choice', title: t('searchChoice') }
  ];
});

const orderDirectionOptions = computed(() => {
  return [
    { value: 'asc', title: t('searchOrderDirectionAsc') },
    { value: 'desc', title: t('searchOrderDirectionDesc') }
  ];
});

function updateFilters(key: string, val: string | boolean) {
  emit('update:modelValue', { ...props.modelValue, [key]: val });
}
</script>

<template>
  <BasePopover :focus="false">
    <template #button>
      <BaseButtonRound class="relative !h-[36px] !w-[36px] border-none">
        <i-ho-funnel class="text-skin-link" />
      </BaseButtonRound>
    </template>
    <template #content>
      <div class="flex">
        <div class="m-4 flex w-full flex-col gap-y-3">
          <div
            class="flex w-full flex-row content-center items-center justify-between gap-x-2"
          >
            <span>{{ $t('searchOrderBy') }}:</span>
            <BaseListbox
              :model-value="modelValue.orderBy"
              :items="orderByOptions"
              class="min-w-[156px]"
              @update:model-value="updateFilters('orderBy', $event)"
            />
          </div>
          <div
            class="flex w-full flex-row content-center items-center justify-between gap-x-2"
          >
            <span>{{ $t('searchOrderDirection') }}:</span>
            <BaseListbox
              :model-value="modelValue.orderDirection"
              :items="orderDirectionOptions"
              class="min-w-[156px]"
              @update:model-value="updateFilters('orderDirection', $event)"
            />
          </div>
          <InputCheckbox
            :model-value="Boolean(modelValue.onlyWithReason)"
            :label="$t('searchOnlyWithReason')"
            name="searchOnlyWithReason"
            class="my-3"
            @update:model-value="updateFilters('onlyWithReason', $event)"
          />
        </div>
      </div>
    </template>
  </BasePopover>
</template>
