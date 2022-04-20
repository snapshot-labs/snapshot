<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';

defineProps<{
  address: string;
  profile?: {
    name: string;
    ens: string;
    about: string;
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
        <h3 v-text="profile?.name || profile?.ens || 'unnamed'" />
        <span v-text="profile?.about" />
      </div>
      <div class="m-4 space-y-2">
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
    </template>
  </BasePopover>
</template>
