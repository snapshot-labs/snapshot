<script setup>
defineProps({
  space: Object
});
</script>

<template>
  <div
    v-if="space && (space.twitter || space.discord)"
    class="text-center border-t bg-skin-header-bg mt-3"
  >
    <div>
      <h3 class="my-3 mx-2 flex justify-center items-center space-x-3">
        <a
          v-if="space.twitter"
          :href="`https://twitter.com/${space.twitter}`"
          target="_blank"
        >
          <Icon size="24" name="twitter" class="hover:opacity-80" />
        </a>
        <a
          v-if="space.github"
          :href="`https://github.com/${space.github}`"
          target="_blank"
        >
          <Icon size="24" name="github" class="hover:opacity-80" />
        </a>
      </h3>
    </div>
  </div>
</template>
