<template>
  <UiModal :open="open" @close="$emit('close')">
    <div class="m-4 mb-0 text-center">
      <Avatar :address="address" size="64" class="mb-4" />
      <h3 v-text="_shorten(address)" />
    </div>
    <div class="m-4">
      <a :href="_explorer(address)" target="_blank" class="mb-2 d-block">
        <UiButton class="button-outline width-full">
          See on Etherscan
          <Icon name="external-link" class="ml-1" />
        </UiButton>
      </a>
    </div>
  </UiModal>
</template>

<script>
export default {
  props: ['open', 'address']
};
</script>
