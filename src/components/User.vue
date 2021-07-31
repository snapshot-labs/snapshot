<script setup>
import { watchEffect, defineProps } from 'vue';
import { useUsername } from '@/composables/useUsername';

const props = defineProps({
  address: String,
  space: Object,
  profile: Object
});

const { address, profile, username } = useUsername();

watchEffect(() => {
  address.value = props.address;
  profile.value = props.profile;
});
</script>

<template>
  <span>
    <UiPopover :options="{ offset: [0, 12], placement: 'bottom-start' }">
      <template v-slot:item>
        <a class="no-wrap">
          <UiAvatar
            :imgsrc="_getUrl(profile?.image)"
            :address="address"
            size="16"
            class="mr-1"
          />
          {{ username }}
          <Badges :address="address" :members="space?.members" />
        </a>
      </template>
      <template v-slot:content>
        <div class="m-4 mb-0 text-center">
          <UiAvatar
            :imgsrc="_getUrl(profile?.image)"
            :address="address"
            size="64"
            class="mb-4"
          />
          <h3 v-if="profile?.name" class="mt-3" v-text="profile.name" />
          <h3 v-else-if="profile?.ens" v-text="profile.ens" class="mt-3" />
          <h3 v-else v-text="_shorten(address)" class="mt-3" />
        </div>
        <div class="m-4">
          <a
            :href="_explorer(space ? space.network : '1', address)"
            target="_blank"
            class="mb-2 d-block"
          >
            <UiButton class="button-outline width-full">
              {{ $t('seeInExplorer') }}
              <Icon name="external-link" class="ml-1" />
            </UiButton>
          </a>
          <a
            v-if="profile?.name || profile?.image"
            :href="`https://3box.io/${address}`"
            target="_blank"
            class="mb-2 d-block"
          >
            <UiButton class="button-outline width-full">
              {{ $t('view3box') }}
              <Icon name="external-link" class="ml-1" />
            </UiButton>
          </a>
        </div>
      </template>
    </UiPopover>
  </span>
</template>
