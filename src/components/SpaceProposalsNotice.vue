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
    class="absolute z-10 !bg-skin-bg left-0"
  >
    <div>
      <div>
        <div>
          <h3 class="mt-0">{{ $t('newSpaceNotice.header') }}</h3>
          <div>
            <Icon name="info" size="24" class="float-left mr-1" />
            <i18n-t keypath="newSpaceNotice.mainText" tag="p">
              <template v-slot:settings>
                <BaseLink
                  :link="{ name: 'spaceSettings', params: { key: spaceId } }"
                >
                  settings</BaseLink
                >
              </template>
            </i18n-t>
          </div>

          <i18n-t keypath="newSpaceNotice.learnMore" tag="p" class="mt-2">
            <template v-slot:documentation>
              <BaseLink
                link="https://docs.snapshot.org/strategies/what-is-a-strategy"
              >
                documentation</BaseLink
              >
            </template>
            <template v-slot:discord>
              <BaseLink link="https://discord.gg/snapshot"> Discord</BaseLink>
            </template>
          </i18n-t>
        </div>
        <UiButton
          class="mt-3"
          @click="createdSpaces[spaceId].showMessage = false"
        >
          {{ $t('newSpaceNotice.gotIt') }}
        </UiButton>
      </div>
    </div>
  </Block>
</template>
