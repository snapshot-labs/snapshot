<script setup lang="ts"></script>

<template>
  <BaseBlock class="mt-4 text-skin-text">
    <BaseIcon
      name="gitbook"
      size="24"
      class="pr-2 !align-middle text-skin-text"
    />
    <i18n-t keypath="setup.helpDocsAndDiscordLinks" tag="span" scope="global">
      <template #docs>
        <BaseLink link="https://docs.snapshot.org/spaces/create">
          documentation</BaseLink
        >
      </template>
      <template #discord>
        <BaseLink link="https://discord.gg/snapshot"> Discord</BaseLink>
      </template>
    </i18n-t>
  </BaseBlock>
</template>
