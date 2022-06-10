<script setup lang="ts">
import { watchEffect } from 'vue';
import { useUsername } from '@/composables/useUsername';
import { useApp } from '@/composables/useApp';

const { domain } = useApp();

const props = defineProps<{
  address: string;
  space?: { members: string[]; network: string };
  proposal?: { network: string };
  profile?: { ens: string; name?: string; about?: string };
  hideAvatar?: boolean;
}>();

const { username, setProfile, setAddress } = useUsername();

watchEffect(() => {
  setProfile(props.profile);
  setAddress(props.address);
});
</script>

<template>
  <div>
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
        @click.stop=""
      >
        <div class="flex flex-nowrap items-center space-x-2">
          <AvatarUser v-if="!hideAvatar" :address="address" size="18" />
          <span class="w-full cursor-pointer truncate text-skin-link">
            {{ username }}
          </span>
          <BaseBadge :address="address" :members="space?.members" />
        </div>
      </BaseLink>
    </PopoverHoverProfile>
  </div>
</template>
