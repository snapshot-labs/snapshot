<script setup lang="ts">
import { Profile, ExtendedSpace, Proposal } from '@/helpers/interfaces';

const { domain } = useApp();

const props = defineProps<{
  address: string;
  space?: Partial<ExtendedSpace>;
  proposal?: Proposal;
  profile?: Profile;
  hideAvatar?: boolean;
  hideUsername?: boolean;
  widthClass?: string;
  textClass?: string;
}>();

const { getUsername } = useUsername();

const spaceMembers = computed(() => {
  if (!props.space) return [];
  return [
    ...(props.space.members || []),
    ...(props.space.moderators || []),
    ...(props.space.admins || [])
  ];
});
</script>

<template>
  <PopoverHoverProfile
    :address="address"
    :profile="profile"
    :proposal="proposal"
    :space="space"
    class="flex"
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
        <AvatarUser v-if="!hideAvatar" :address="address" size="20" />
        <span
          v-if="!hideUsername"
          class="w-full cursor-pointer truncate text-skin-link"
          :class="textClass"
        >
          {{ getUsername(address, profile) }}
        </span>
        <BaseBadge
          v-if="getUsername(address, profile) !== 'You'"
          :address="address"
          :members="spaceMembers"
        />
      </div>
    </BaseLink>
  </PopoverHoverProfile>
</template>
