<script setup lang="ts">
const socials = [
  {
    icon: 'x',
    link: 'https://x.com/SnapshotLabs'
  },
  {
    icon: 'discord',
    link: 'https://discord.snapshot.org/'
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
      <BaseLink :link="social.link" hide-external-icon>
        <FooterSocialsItem v-if="social.icon === 'youtube'">
          <i-s-youtube class="text-[25px]" />
        </FooterSocialsItem>
        <FooterSocialsItem v-else-if="social.icon === 'x'">
          <i-s-x class="text-[23px]" />
        </FooterSocialsItem>
        <FooterSocialsItem v-else-if="social.icon === 'discord'">
          <i-s-discord class="text-[23px]" />
        </FooterSocialsItem>
      </BaseLink>
    </span>
  </div>
</template>
