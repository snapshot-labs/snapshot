<script setup lang="ts">
import { Delegate, Profile, ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  delegate: Delegate;
  profiles: Record<string, Profile>;
  space: ExtendedSpace;
}>();

const { getUsername } = useUsername();
const { formatCompactNumber } = useIntl();
</script>

<template>
  <div class="flex flex-col justify-between rounded-xl border p-4">
    <PopoverHoverProfile
      :address="delegate.id"
      :profile="profiles[delegate.id]"
      :space="space"
    >
      <div class="flex text-left">
        <AvatarUser :address="delegate.id" size="48" />
        <div class="ml-3">
          <div class="font-semibold text-skin-heading">
            {{ getUsername(delegate.id, profiles[delegate.id]) }}
          </div>
          <div>
            {{ formatCompactNumber(Number(delegate.delegatedVotes)) }}
            {{ space.symbol }}
          </div>
        </div>
      </div>
    </PopoverHoverProfile>
    <div class="mt-4 line-clamp-3 h-full">
      <span v-if="delegate?.statement">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui repudiandae
        reprehenderit repellat, reiciendis modi tempora eaque velit magnam rem
        perferendis.
      </span>

      <span v-else> This delegate hasn't added a statement yet. </span>
    </div>
    <div class="mt-4 flex items-end justify-between">
      {{ formatCompactNumber(Number(delegate.tokenHoldersRepresentedAmount)) }}
      delegators

      <TuneButton> Delegate </TuneButton>
    </div>
  </div>
</template>
