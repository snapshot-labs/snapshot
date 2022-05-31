<script setup lang="ts">
import { watchEffect } from 'vue';
import { useUsername } from '@/composables/useUsername';

const props = defineProps<{
  address: string;
  space?: { members: string[]; network: string };
  proposal?: { network: string };
  profile?: { name: string; ens: string; about: string };
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
    <PopoverProfile
      :address="address"
      :profile="profile"
      :proposal="proposal"
      :space="space"
    >
      <div class="flex flex-nowrap items-center space-x-2">
        <AvatarUser v-if="!hideAvatar" :address="address" size="18" />
        <span class="truncate w-full text-skin-link cursor-pointer">
          {{ username }}
        </span>
        <BaseBadge :address="address" :members="space?.members" />
      </div>
    </PopoverProfile>
  </div>
</template>
