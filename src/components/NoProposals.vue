<script setup>
defineProps(['space']);
</script>
<template>
  <div class="mb-3 text-center">
    <Block class="pt-1">
      <div class="mb-3">
        {{ $t('noResultsFound') }}
      </div>
      <router-link :to="{ name: 'spaceCreate', params: { key: space.id } }">
        <UiButton>
          {{ $t('proposals.createProposal') }}
        </UiButton>
      </router-link>
    </Block>
  </div>
</template>
