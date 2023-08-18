<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';
import {
  DelegateWithPercent,
  Profile,
  ExtendedSpace,
  DelegatesVote,
  DelegatesProposal
} from '@/helpers/interfaces';

const props = defineProps<{
  delegate: DelegateWithPercent;
  profiles: Record<string, Profile>;
  space: ExtendedSpace;
  stats?: {
    votes: DelegatesVote[];
    proposals: DelegatesProposal[];
  };
  loading: boolean;
  about?: string;
}>();

const emit = defineEmits(['clickDelegate', 'clickUser']);

const { getUsername } = useUsername();
const { formatCompactNumber } = useIntl();
const { formatPercentageNumber } = useStatement();

const aboutLoadedOnce = ref(false);

const dropdownItems = computed(() => [
  {
    text: 'View profile',
    action: 'viewProfile'
  },
  {
    text: 'See explorer',
    action: 'seeExplorer'
  }
]);

function handleDropdownAction(action: string) {
  if (action === 'viewProfile') {
    emit('clickUser');
  }
  if (action === 'seeExplorer') {
    window.open(
      explorerUrl(props.space.network, props.delegate.id),
      '_blank',
      'noopener,noreferrer'
    );
  }
}

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
    class="flex h-full flex-col justify-between border-t border-skin-border px-4 pb-4 pt-3 md:rounded-xl md:border md:px-3 md:pb-3 md:pt-[12px]"
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
      <BaseMenu :items="dropdownItems" @select="handleDropdownAction($event)">
        <template #button>
          <BaseButtonIcon class="-mr-1 !h-[28px]">
            <i-ho-dots-horizontal class="text-[17px]" />
          </BaseButtonIcon>
        </template>
        <template #item="{ item }">
          <div class="w-[170px] text-skin-link">
            <span>
              {{ item.text }}
              <i-ho-external-link
                v-if="item.action === 'seeExplorer'"
                class="inline-block text-sm"
              />
            </span>
          </div>
        </template>
      </BaseMenu>
    </div>

    <div class="mt-3 h-[48px] cursor-pointer" @click="emit('clickUser')">
      <div
        v-if="loading && !aboutLoadedOnce"
        class="lazy-loading h-[24px] w-11/12 rounded-md"
      />

      <template v-else-if="about">
        <span class="line-clamp-2">
          {{ about }}
        </span>
      </template>
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
