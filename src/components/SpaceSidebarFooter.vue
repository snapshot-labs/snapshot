<script setup lang="ts">
const props = defineProps<{ space?: Record<string, any> }>();

const socials = [
  {
    social: 'twitter',
    icon: 'twitter',
    path:
      (props.space?.twitter && `https://twitter.com/${props.space?.twitter}`) ||
      ''
  },
  {
    icon: 'github',
    social: 'github',
    path:
      (props.space?.github && `https://github.com/${props.space?.github}`) || ''
  },
  {
    icon: 'earth',
    social: 'website',
    path: (props.space?.website && props.space?.website) || ''
  }
];
</script>

<template>
  <div class="text-center border-t bg-skin-header-bg">
    <div class="my-3 mx-2 flex justify-center items-center space-x-3">
      <BaseLink
        v-for="social in socials"
        :link="social.path"
        :key="social.social"
        hide-external-icon
        :disabled="!social.path"
      >
        <Icon
          size="24"
          :name="social.icon"
          :class="
            social.path ? 'hover:opacity-80 text-skin-text' : 'opacity-20'
          "
        />
      </BaseLink>
    </div>
  </div>
</template>
