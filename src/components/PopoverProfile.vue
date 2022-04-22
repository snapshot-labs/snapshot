<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';

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
            <BaseAvatar :address="address" size="69" />
          </div>
          <div>
            <ProfileName :profile="profile" />
            <ProfileAddressCopy :profile="profile" :userAddress="address" />
          </div>
        </div>
        <p v-if="profile?.about" class="mt-4">
          {{ profile.about }}
        </p>

        <div class="flex w-full mt-4">
          <div class="w-1/2 pr-2">
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
          <div class="w-1/2 pl-2">
            <BaseButton
              @click="
                $router.push({ name: 'profileAbout', params: { address } })
              "
              primary
              class="w-full"
            >
              {{ $t('profile.viewProfile') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </template>
  </BasePopover>
</template>
