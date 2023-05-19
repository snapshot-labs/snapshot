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
}>();

const emit = defineEmits(['clickDelegate']);

const { domain } = useApp();
const { getUsername } = useUsername();
const { formatCompactNumber } = useIntl();
</script>

<template>
  <div class="flex h-full flex-col justify-between rounded-xl border p-4">
    <PopoverHoverProfile
      :address="delegate.id"
      :profile="profiles[delegate.id]"
      :space="space"
    >
      <BaseLink
        :link="
          domain
            ? `https://snapshot.org/#/profile/${delegate.id}`
            : { name: 'profileActivity', params: { address: delegate.id } }
        "
        hide-external-icon
        tabindex="-1"
        @click.stop=""
      >
        <div class="flex text-left">
          <AvatarUser :address="delegate.id" size="48" />
          <div class="ml-3">
            <div class="font-semibold text-skin-heading">
              {{ getUsername(delegate.id, profiles[delegate.id]) }}
            </div>
            <div class="text-skin-text">
              {{ formatCompactNumber(Number(delegate.delegatedVotes)) }}
              {{ space.symbol }}
            </div>
          </div>
        </div>
      </BaseLink>
    </PopoverHoverProfile>
    <div class="mt-2 h-full">
      <template v-if="delegate?.statement">
        <span class="line-clamp-3">
          {{ delegate.statement }}
        </span>
        <span class="cursor-pointer text-skin-link"> Lean more </span>
      </template>

      <span v-else> No statement provided yet </span>
    </div>
    <div class="mt-3 flex items-center justify-between">
      {{ formatCompactNumber(Number(delegate.tokenHoldersRepresentedAmount)) }}
      delegators

      <TuneButton class="text-skin-link" @click="emit('clickDelegate')">
        Delegate
      </TuneButton>
    </div>
  </div>
</template>
