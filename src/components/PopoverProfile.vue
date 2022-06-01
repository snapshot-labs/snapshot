<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';
import { useApp } from '@/composables/useApp';

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
  <BasePopover :options="{ offset: [0, 12], placement: 'bottom-start' }">
    <template v-slot:item>
      <slot />
    </template>
    <template v-slot:content>
      <div class="w-[400px] p-4">
        <div class="flex">
          <div>
            <AvatarUser :address="address" size="69" />
          </div>
          <div>
            <ProfileName :profile="profile" :address="address" />
            <ProfileAddressCopy :profile="profile" :userAddress="address" />
          </div>
        </div>
        <p v-if="profile?.about" class="mt-4">
          {{ profile.about }}
        </p>

        <div class="flex w-full mt-4">
          <div class="w-1/2 pr-2">
            <BaseLink
              :link="
                domain
                  ? `https://snapshot.org/#/profile/${address}`
                  : { name: 'profileActivity', params: { address } }
              "
              hide-external-icon
              @click.stop
            >
              <BaseButton primary class="w-full">
                {{ $t('profile.viewProfile') }}
              </BaseButton>
            </BaseLink>
          </div>
          <div class="w-1/2 pl-2">
            <BaseLink
              @click.stop
              :link="
                explorerUrl(proposal?.network || space?.network || '1', address)
              "
              hide-external-icon
            >
              <BaseButton class="w-full">
                {{ $t('seeInExplorer') }}
                <BaseIcon name="external-link" class="ml-1" />
              </BaseButton>
            </BaseLink>
          </div>
        </div>
      </div>
    </template>
  </BasePopover>
</template>
