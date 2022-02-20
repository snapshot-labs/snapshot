<script setup>
defineProps({
  space: Object
});
</script>

<script>
export default {
  data () {
    return {
      socials: [
        {
          url: 'https://github.com/',
          spaceAttribute: 'github',
          icon: 'github',
        },
        {
          url: 'https://twitter.com/',
          spaceAttribute: 'twitter',
          icon: 'twitter',
        },
        {
          url: 'https://discord.gg/',
          spaceAttribute: 'discord',
          icon: 'discord',
        },
      ]
    }
  },
  computed: {
    spaceSocials() {
      return this.socials.filter(social => this.space[social.spaceAttribute])
    }
  }
}
</script>

<template>
  <div
    v-if="space && spaceSocials.length"
    class="text-center border-t bg-skin-header-bg mt-3"
  >
    <div>
      <h3 class="my-2 mx-2 flex justify-center items-center space-x-3">
        <a 
          v-for="(social, i) in spaceSocials" 
          :key="i"
          :href="`${social.url}${space[social.spaceAttribute]}`"
          target="_blank"
        >
          <Icon
            size="22"
            :name="`${social.icon}`"
            class="text-skin-text"
            @mouseover="$event.target.classList.remove('text-skin-text')"
            @mouseout="$event.target.classList.add('text-skin-text')"
          />
        </a>
      </h3>
    </div>
  </div>
</template>