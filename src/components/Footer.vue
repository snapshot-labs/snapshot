<script setup>
import pkg from '@/../package.json';

const yearNow = new Date().getFullYear();

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
    icon: 'github',
    link: `https://github.com/${pkg.repository}`
  },
  {
    icon: 'gitbook',
    link: 'https://docs.snapshot.org/'
  }
];
</script>

<template>
  <Container class="flex items-center justify-between py-6">
    <div>© {{ yearNow }} Snapshot Labs.</div>
    <div class="flex items-center">
      <div class="text-center space-x-3">
        <span v-for="social in socials" :key="social">
          <BaseLink :link="social.link" hide-external-icon>
            <Icon
              size="30"
              class="hover:opacity-80 text-skin-text"
              :name="social.icon"
            />
          </BaseLink>
        </span>
      </div>
      <SelectLanguageButton class="ml-4" />
    </div>
  </Container>
</template>
