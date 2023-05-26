<script setup lang="ts">
defineProps<{
  context?: 'setup' | 'settings';
  error?: string;
}>();
</script>

<template>
  <BaseMessageBlock v-if="error" level="warning-red" class="mt-3">
    <span v-if="error === 'ticketWithAnyOrBasicError'">
      <i18n-t
        :keypath="
          context === 'setup'
            ? 'ticketWithAnyOrBasicErrorSetup'
            : 'ticketWithAnyOrBasicError'
        "
        tag="span"
        scope="global"
      >
        <template #demo>
          <BaseLink link="https://demo.snapshot.org">
            demo.snapshot.org</BaseLink
          >
        </template>
        <template #article>
          <BaseLink
            link="https://snapshot.mirror.xyz/-uSylOUP82hGAyWUlVn4lCg9ESzKX9QCvsUgvv-ng84"
          >
            {{ $t('learnMore') }}
          </BaseLink>
        </template>
      </i18n-t>
    </span>

    <span v-else>
      {{ error }}
    </span>
  </BaseMessageBlock>
</template>
