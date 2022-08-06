<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';
import { useApp } from '@/composables/useApp';
import { useMediaQuery } from '@vueuse/core';

const isXLargeScreen = useMediaQuery('(min-width: 1280px)');

defineProps<{
  address: string;
  profile?: {
    ens: string;
    name?: string;
    about?: string;
  };
  proposal?: {
    network: string;
  };
  space?: {
    members: string[];
    network: string;
  };
}>();

const { domain } = useApp();
</script>

<template>
  <BasePopoverHover :placement="isXLargeScreen ? 'bottom' : 'bottom-start'">
    <template #button>
      <slot />
    </template>
    <template #content>
      <div class="p-4">
        <div class="flex">
          <div>
            <AvatarUser :address="address" size="69" />
          </div>
          <div>
            <ProfileName :profile="profile" :address="address" />
            <ProfileAddressCopy :profile="profile" :user-address="address" />
          </div>
        </div>
        <p v-if="profile?.about" class="mt-4">
          {{ profile.about }}
        </p>

        <div class="mt-4 flex w-full">
          <div class="w-1/2 pr-2">
            <BaseLink
              :link="
                domain
                  ? `https://snapshot.org/#/profile/${address}`
                  : { name: 'profileActivity', params: { address } }
              "
              hide-external-icon
            >
              <BaseButton primary class="w-full">
                {{ $t('profile.viewProfile') }}
              </BaseButton>
            </BaseLink>
          </div>
          <div class="w-1/2 pl-2">
            <BaseLink
              :link="
                explorerUrl(proposal?.network || space?.network || '1', address)
              "
              hide-external-icon
            >
              <BaseButton class="w-full">
                {{ $t('seeInExplorer') }}
                <i-ho-external-link class="mb-[2px] inline-block text-xs" />
              </BaseButton>
            </BaseLink>
          </div>
        </div>
      </div>
    </template>
  </BasePopoverHover>
</template>
