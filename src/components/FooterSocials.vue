<script setup lang="ts">
const socials = [
  {
    icon: 'twitter',
    link: 'https://twitter.com/SnapshotLabs'
  },
  {
    icon: 'discord',
    link: 'https://discord.gg/snapshot'
  },
  {
    icon: 'telegram',
    link: 'https://t.me/snapshotlabs'
  },
  {
    icon: 'youtube',
    link: `https://www.youtube.com/channel/UCKiOLUMQNj77m_zhQnfdzsg`
  }
];
</script>

<template>
  <div
    class="flex items-center justify-center space-x-3 pt-2 md:mt-4 md:justify-start lg:mt-0 lg:justify-end"
  >
    <span v-for="social in socials" :key="social.icon">
      <BaseLink :link="social.link" hide-external-icon @click.stop="null">
        <FooterSocialsItem v-if="social.icon === 'youtube'">
          <i-s-youtube class="text-[25px]" />
        </FooterSocialsItem>
        <FooterSocialsItem v-else-if="social.icon === 'twitter'">
          <i-s-twitter class="text-[24px]" />
        </FooterSocialsItem>
        <FooterSocialsItem v-else-if="social.icon === 'discord'">
          <i-s-discord class="text-[23px]" />
        </FooterSocialsItem>
        <FooterSocialsItem v-else-if="social.icon === 'telegram'">
          <i-s-telegram class="text-[21px]" />
        </FooterSocialsItem>
      </BaseLink>
    </span>
  </div>
</template>
