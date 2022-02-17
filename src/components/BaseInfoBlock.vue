<script setup>
defineProps({
  routeObject: {
    type: Object
  },
  externalHref: {
    type: String
  },
  linkText: {
    type: String
  }
});
</script>

<template>
  <Block>
    <Icon name="info" size="18" class="mr-1" />

    <slot />
    <div>
      <a
        v-if="routeObject"
        @click="$router.push(routeObject)"
        class="whitespace-nowrap"
      >
        {{ linkText ? linkText : $t('learnMore') }}
      </a>
      <a
        v-else-if="externalHref"
        :href="externalHref"
        target="_blank"
        class="whitespace-nowrap"
        rel="noopener noreferrer"
      >
        {{ linkText ? linkText : $t('learnMore') }}
        <Icon name="external-link" />
      </a>
    </div>
  </Block>
</template>
