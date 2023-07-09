<script setup lang="ts">
import {
  DelegateWithPercent,
  Profile,
  ExtendedSpace
} from '@/helpers/interfaces';

defineProps<{
  delegate: DelegateWithPercent;
  profiles: Record<string, Profile>;
  space: ExtendedSpace;
  loading: boolean;
  about?: string;
}>();

const emit = defineEmits(['clickDelegate', 'clickUser']);

const { getUsername } = useUsername();
const { formatCompactNumber } = useIntl();
const { formatPercentageNumber } = useStatement();
</script>

<template>
  <div
    class="flex h-full flex-col justify-between border-y border-skin-border p-4 md:rounded-xl md:border"
  >
    <button @click="emit('clickUser')">
      <div class="flex text-left">
        <AvatarUser :address="delegate.id" size="48" />
        <div class="ml-3">
          <div class="font-semibold text-skin-heading">
            {{ getUsername(delegate.id, profiles[delegate.id]) }}
          </div>
          <div
            v-tippy="{
              content: formatPercentageNumber(delegate.votesPercentage)
            }"
            class="text-skin-text"
          >
            {{ formatCompactNumber(Number(delegate.delegatedVotes)) }}
            {{ space.symbol }}
          </div>
        </div>
      </div>
    </button>

    <div class="mt-3 h-full">
      <template v-if="loading">
        <div class="lazy-loading h-3 w-11/12 rounded-md" />
        <div class="lazy-loading mt-1 h-3 w-7/12 rounded-md" />
      </template>

      <template v-else-if="about">
        <span class="line-clamp-2">
          {{ about }}
        </span>
        <span class="cursor-pointer text-skin-link" @click="emit('clickUser')">
          Learn more
        </span>
      </template>

      <span v-else> No statement provided yet </span>
    </div>
    <div
      v-tippy="{
        content: formatPercentageNumber(delegate.delegatorsPercentage)
      }"
      class="mt-3 flex items-center justify-between"
    >
      {{ formatCompactNumber(Number(delegate.tokenHoldersRepresentedAmount)) }}
      delegators

      <TuneButton class="text-skin-link" @click="emit('clickDelegate')">
        Delegate
      </TuneButton>
    </div>
  </div>
</template>
