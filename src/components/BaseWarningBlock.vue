<script setup>
defineProps({
  routeObject: {
    type: Object
  },
  externalHref: {
    type: String
  }
});
</script>

<template>
  <Block class="!border-skin-link text-skin-link">
    <Icon name="warning" class="mr-1" />
    <slot />
    <div>
      <a
        v-if="routeObject"
        @click="$router.push(routeObject)"
        class="whitespace-nowrap"
        >{{ $t('learnMore') }}
      </a>
      <a
        v-else-if="externalHref"
        :href="externalHref"
        target="_blank"
        class="whitespace-nowrap"
        rel="noopener noreferrer"
        >{{ $t('learnMore') }}
        <Icon name="external-link" />
      </a>
    </div>
  </Block>
</template>
