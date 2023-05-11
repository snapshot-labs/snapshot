<script setup lang="ts">
import { Profile, ExtendedSpace, Proposal } from '@/helpers/interfaces';

const { domain } = useApp();

defineProps<{
  address: string;
  space?: ExtendedSpace;
  proposal?: Proposal;
  profile?: Profile;
  hideAvatar?: boolean;
  hideUsername?: boolean;
  widthClass?: string;
}>();

const { getUsername } = useUsername();
</script>

<template>
  <PopoverHoverProfile
    :address="address"
    :profile="profile"
    :proposal="proposal"
    :space="space"
  >
    <BaseLink
      :link="
        domain
          ? `https://snapshot.org/#/profile/${address}`
          : { name: 'profileActivity', params: { address } }
      "
      hide-external-icon
      tabindex="-1"
      @click.stop=""
    >
      <div :class="[widthClass, 'flex flex-nowrap items-center space-x-1']">
        <AvatarUser v-if="!hideAvatar" :address="address" size="18" />
        <span
          v-if="!hideUsername"
          class="w-full cursor-pointer truncate text-skin-link"
        >
          {{ getUsername(address, profile) }}
        </span>
        <BaseBadge :address="address" :members="space?.members" />
      </div>
    </BaseLink>
  </PopoverHoverProfile>
</template>
