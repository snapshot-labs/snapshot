<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';
import { useMediaQuery } from '@vueuse/core';
import { Profile, ExtendedSpace, Proposal } from '@/helpers/interfaces';

const isXLargeScreen = useMediaQuery('(min-width: 1280px)');

defineProps<{
  address: string;
  profile?: Profile;
  proposal?: Proposal;
  space?: ExtendedSpace;
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
          <div class="px-3">
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
              <BaseButton primary class="w-full" tabindex="-1">
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
              <BaseButton class="w-full" tabindex="-1">
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
