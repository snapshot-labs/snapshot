<template>
  <UiModal :open="open" @close="$emit('close')">
    <div class="m-4 mb-0 text-center">
      <UiAvatar
        :imgsrc="profile?.image"
        :address="address"
        size="64"
        class="mb-4"
      />
      <h3 v-if="profile?.name" class="mt-3" v-text="profile.name" />
      <h3 v-else-if="profile.ens" v-text="profile.ens" class="mt-3" />
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
  </UiModal>
</template>

<script>
export default {
  props: ['open', 'address', 'space', 'profile'],
  emits: ['close']
};
</script>
