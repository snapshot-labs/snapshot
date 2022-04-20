<script setup lang="ts">
import { watchEffect } from 'vue';
import { useUsername } from '@/composables/useUsername';

const props = defineProps<{
  address: string;
  space?: { members: string[]; network: string };
  proposal?: { network: string };
  profile?: { name: string; ens: string; about: string };
  onlyUsername?: boolean;
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
      <router-link :to="{ name: 'profileAbout', params: { address } }">
        <a class="flex flex-nowrap">
          <BaseAvatar
            v-if="!onlyUsername"
            :address="address"
            size="18"
            class="mr-2"
          />
          <span class="truncate w-full">{{ username }}</span>
          <BaseBadge
            v-if="!onlyUsername"
            :address="address"
            :members="space?.members"
          />
        </a>
      </router-link>
    </PopoverProfile>
  </div>
</template>
