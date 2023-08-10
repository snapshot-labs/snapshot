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
  stats?: {
    votes: any;
    proposals: any;
  };
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
    class="flex h-full flex-col justify-between border-y border-skin-border p-3 pt-[12px] md:rounded-xl md:border"
  >
    <div class="flex justify-between">
      <button
        type="button"
        class="flex items-center text-left"
        @click="emit('clickUser')"
      >
        <AvatarUser :address="delegate.id" size="40" />
        <div class="ml-3">
          <div class="font-semibold text-skin-heading">
            {{ getUsername(delegate.id, profiles[delegate.id]) }}
          </div>
          <div class="flex gap-1">
            <div
              v-tippy="{
                content: formatPercentageNumber(delegate.votesPercentage)
              }"
              class="text-skin-text"
            >
              {{ formatCompactNumber(Number(delegate.delegatedVotes)) }}
              {{ space.symbol }}
            </div>
            ·
            <div
              v-tippy="{
                content: formatPercentageNumber(delegate.delegatorsPercentage)
              }"
            >
              {{
                formatCompactNumber(
                  Number(delegate.tokenHoldersRepresentedAmount)
                )
              }}
              delegators
            </div>
          </div>
        </div>
      </button>
      <BaseButtonIcon class="-mr-1 -mt-1 h-[36px]">
        <i-ho-dots-horizontal class="text-[17px]" />
      </BaseButtonIcon>
    </div>

    <div class="my-3 h-full">
      <div v-if="loading" class="lazy-loading h-[24px] w-11/12 rounded-md" />

      <template v-else-if="about">
        <span class="line-clamp-2 h-3">
          {{ about }}
        </span>
        <span class="cursor-pointer text-skin-link" @click="emit('clickUser')">
          Learn more
        </span>
      </template>

      <span v-else> No statement provided yet </span>
    </div>

    <TuneButton
      class="mt-4 w-full text-skin-link"
      @click="emit('clickDelegate')"
    >
      Delegate
    </TuneButton>
  </div>
</template>
