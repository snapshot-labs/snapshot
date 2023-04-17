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
  if (key === 'choice') {
    let choice_in = props.modelValue.choice_in || [];
    const choice = val as string;
    if (choice_in?.includes(choice)) {
      choice_in = choice_in.filter(c => c !== choice);
    } else {
      choice_in?.push(choice);
    }
    emit('update:modelValue', { ...props.modelValue, choice_in });
  } else {
    emit('update:modelValue', { ...props.modelValue, [key]: val });
  }
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
          <span>Choices:</span>
          <div v-for="p in proposal.choices" :key="p">
            <InputCheckbox
              :model-value="Boolean(modelValue.choice_in?.includes(p))"
              :label="p"
              :name="`choice-${p}`"
              class=""
              @update:model-value="updateFilters('choice', p)"
            />
          </div>
        </div>
      </div>
    </template>
  </BasePopover>
</template>
