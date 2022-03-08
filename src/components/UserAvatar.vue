<script setup lang="ts">
import { watchEffect } from 'vue';
import { shorten, explorerUrl } from '@/helpers/utils';
import { useUsername } from '@/composables/useUsername';

const props = defineProps<{
  address: string;
  space?: { members: string[]; network: string };
  proposal?: { network: string };
  profile?: { name: string; ens: string };
  onlyUsername?: boolean;
}>();

const { username, setProfile, setAddress } = useUsername();

watchEffect(() => {
  setProfile(props.profile);
  setAddress(props.address);
});
</script>

<template>
  <span>
    <UiPopover :options="{ offset: [0, 12], placement: 'bottom-start' }">
      <template v-slot:item>
        <a class="flex flex-nowrap">
          <BaseAvatar
            v-if="!onlyUsername"
            :address="address"
            size="18"
            class="mr-2"
          />
          <span class="truncate w-full">{{ username }}</span>
          <Badges
            v-if="!onlyUsername"
            :address="address"
            :members="space?.members"
          />
        </a>
      </template>
      <template v-slot:content>
        <div class="m-4 mb-0 text-center">
          <BaseAvatar :address="address" size="64" class="mb-4" />
          <h3 v-if="profile?.name" class="mt-3" v-text="profile.name" />
          <h3 v-else-if="profile?.ens" v-text="profile.ens" class="mt-3" />
          <h3 v-else v-text="shorten(address)" class="mt-3" />
        </div>
        <div class="m-4">
          <a
            :href="
              explorerUrl(proposal?.network || space?.network || '1', address)
            "
            target="_blank"
            class="mb-2 block"
          >
            <UiButton class="button-outline w-full">
              {{ $t('seeInExplorer') }}
              <Icon name="external-link" class="ml-1" />
            </UiButton>
          </a>
        </div>
      </template>
    </UiPopover>
  </span>
</template>
