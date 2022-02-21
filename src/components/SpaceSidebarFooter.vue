<script setup>
defineProps({
  space: Object
});
</script>

<template>
  <div
    v-if="space.twitter || space.github || space.discord || space.website"
    class="border-t bg-skin-header-bg mt-3"
  >
    <div class="py-3">
      <a 
        v-if="space.twitter"
        :href="`https://twitter.com/${space.twitter}`" 
        class="flex align-middle px-4 py-2 sidenav-item"
      >
        <Icon
          size="22"
          name="twitter"
          class="text-skin-text mr-1 hover:opacity-80"
        />
        <span v-text="`Twitter`"/>
      </a>
      <a 
        v-if="space.github"
        :href="`https://github.com/${space.github}`" 
        class="flex align-middle px-4 py-2 sidenav-item"
      >
        <Icon
          size="22"
          name="github"
          class="text-skin-text mr-1 hover:opacity-80"
        />
        <span v-text="`Github`"/>
      </a>
      <a 
        v-if="space.discord"
        :href="`https://discord.gg/${space.discord}`" 
        class="flex align-middle px-4 py-2 sidenav-item"
      >
        <Icon
          size="22"
          name="discord"
          class="text-skin-text mr-1 hover:opacity-80"
        />
        <span v-text="`Discord`"/>
      </a>
      <a 
        v-if="space.website"
        :href="`${space.website}`" 
        class="flex align-middle px-4 py-2 sidenav-item"
      >
        <Icon
          size="22"
          name="earth"
          class="text-skin-text mr-1 hover:opacity-80"
        />
        <span v-text="`Website`"/>
      </a>
    </div>
  </div>
</template>