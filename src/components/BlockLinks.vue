<script setup lang="ts">
defineProps<{
  twitter?: string;
  github?: string;
  website?: string;
  getErrorMessage: (field: string) => string;
}>();

const emit = defineEmits(['update:twitter', 'update:github', 'update:website']);
</script>

<template>
  <BaseBlock title="Social links">
    <div class="space-y-2">
      <InputSocial
        title="Twitter"
        :model-value="twitter"
        :error="getErrorMessage('twitter')"
        icon="twitter"
        placeholder="e.g. elonmusk"
        @update:model-value="value => emit('update:twitter', value)"
      />
      <InputSocial
        title="Github"
        :model-value="github"
        :error="getErrorMessage('github')"
        icon="github"
        placeholder="e.g. vbuterin"
        @update:model-value="value => emit('update:github', value)"
      />
      <InputUrl
        title="Website"
        :model-value="website"
        :error="getErrorMessage('website')"
        placeholder="www.example.com"
        @update:model-value="value => emit('update:website', value)"
      />
    </div>
  </BaseBlock>
</template>
