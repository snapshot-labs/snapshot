<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ space?: Record<string, any> }>();

const socials = computed(() => {
  return [
    {
      icon: 'twitter',
      link: props.space?.twitter
        ? `https://twitter.com/${props.space?.twitter}`
        : ''
    },
    {
      icon: 'github',
      link: props.space?.github
        ? `https://github.com/${props.space?.github}`
        : ''
    },
    {
      icon: 'earth',
      link: props.space?.website || ''
    }
  ];
});
</script>

<template>
  <div class="text-center border-t bg-skin-header-bg">
    <div class="my-3 mx-2 flex justify-center items-center space-x-3">
      <IconSocial
        v-for="social in socials"
        :key="social.icon"
        :social="social"
        class="flex"
      />
    </div>
  </div>
</template>
