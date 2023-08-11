<script setup lang="ts">
import {
  DelegateWithPercent,
  Profile,
  ExtendedSpace
} from '@/helpers/interfaces';

const props = defineProps<{
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

const aboutLoadedOnce = ref(false);

watch(
  () => props.loading,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      aboutLoadedOnce.value = true;
    }
  }
);
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
          <div class="flex gap-[6px]">
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

    <div class="mt-3 h-[48px]">
      <div
        v-if="loading && !aboutLoadedOnce"
        class="lazy-loading h-[24px] w-11/12 rounded-md"
      />

      <template v-else-if="about">
        <span class="line-clamp-2">
          {{ about }}
        </span>
      </template>

      <span v-else> No statement provided yet. </span>
    </div>

    <div class="mt-3 flex gap-[6px]">
      <div>
        {{ formatCompactNumber(stats?.votes.length || 0) }}
        votes
      </div>
      ·
      <div>
        {{ formatCompactNumber(stats?.proposals.length || 0) }}
        proposals
      </div>
    </div>

    <TuneButton
      class="mt-3 w-full text-skin-link"
      @click="emit('clickDelegate')"
    >
      Delegate
    </TuneButton>
  </div>
</template>
