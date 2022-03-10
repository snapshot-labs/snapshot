<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const props = defineProps<{
  spaceId: string;
  web3Account: string;
}>();

// Reactive local storage with help from vueuse package
const createdSpaces = useStorage(
  `snapshot.createdSpaces.${props.web3Account.slice(0, 8).toLowerCase()}`,
  {}
);
</script>

<template>
  <Block
    v-if="createdSpaces?.[spaceId]?.showMessage"
    class="absolute z-10 !bg-skin-bg"
  >
    <h3>{{ $t('welcomeToSpace.title') }}</h3>

    <i18n-t keypath="welcomeToSpace.mainText" tag="p" class="mt-4">
      <template v-slot:playground>
        <BaseLink
          :link="{
            name: 'playground',
            params: { name: 'erc20-balance-of' }
          }"
        >
          playground</BaseLink
        >
      </template>
      <template v-slot:settings>
        <BaseLink
          :link="{
            name: 'spaceSettings',
            params: { key: spaceId }
          }"
        >
          settings
        </BaseLink>
      </template>
    </i18n-t>

    <i18n-t keypath="welcomeToSpace.learnMore" tag="p" class="mt-3">
      <template v-slot:documentation>
        <BaseLink
          link="https://docs.snapshot.org/spaces/create"
          hide-external-icon
        >
          documentation
        </BaseLink>
      </template>
      <template v-slot:discord>
        <BaseLink link="https://discord.gg/snapshot" hide-external-icon>
          discord
        </BaseLink>
      </template>
    </i18n-t>

    <UiButton
      class="mt-4 px-6"
      @click="createdSpaces[spaceId].showMessage = false"
    >
      {{ $t('welcomeToSpace.gotIt') }}
    </UiButton>
  </Block>
</template>
