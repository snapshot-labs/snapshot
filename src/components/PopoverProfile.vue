<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';

defineProps<{
  address: string;
  profile?: {
    name: string;
    ens: string;
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
      <div class="m-4 mb-0 text-center">
        <div class="flex justify-center">
          <BaseAvatar :address="address" size="80" />
        </div>
        <h3 v-if="profile?.name" v-text="profile.name" />
        <h3 v-else-if="profile?.ens" v-text="profile.ens" />
        <h3 v-else v-text="shorten(address)" />
      </div>
      <div class="m-4 space-y-2">
        <BaseLink
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
    </template>
  </BasePopover>
</template>
