<script setup>
defineProps(['space']);
</script>
<template>
  <div class="mb-3 text-center">
    <BaseBlock class="pt-1">
      <div class="mb-3">
        {{ $t('noResultsFound') }}
      </div>
      <router-link
        :to="{ name: 'spaceCreate', params: { key: space.id, step: 1 } }"
      >
        <BaseButton>
          {{ $t('proposals.createProposal') }}
        </BaseButton>
      </router-link>
    </BaseBlock>
  </div>
</template>
