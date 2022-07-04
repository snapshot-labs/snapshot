<script setup>
import { onMounted } from 'vue';
import { useI18n } from '@/composables/useI18n';

const { setPageTitle } = useI18n();

onMounted(() => {
  setPageTitle('Snapshot - Where decisions get made');
});

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
    link: `https://github.com/snapshot-labs`
  },
  {
    icon: 'gitbook',
    link: 'https://docs.snapshot.org/'
  }
];
</script>

<template>
  <div>
    <img src="/about/main.png" class="absolute right-0 top-[225px]" />
    <img
      src="/about/big_planet.png"
      class="absolute right-[570px] top-[270px]"
    />

    <nav
      id="topnav"
      class="fixed z-10 flex h-[90px] w-full items-center border-b bg-skin-bg"
    >
      <BaseContainer class="w-full !max-w-[1200px] pl-[60px]">
        <router-link :to="{ path: '/' }" class="flex items-center text-[32px]">
          <BaseIcon size="40" name="snapshot" class="text-snapshot" />
          snapshot
        </router-link>
      </BaseContainer>
    </nav>

    <div id="content" class="flex bg-skin-bg pt-[90px]">
      <BaseContainer
        class="w-full !max-w-[1200px] border-l bg-gradient-to-r from-skin-bg to-transparent pl-0 font-mono"
      >
        <h1
          class="relative mt-[160px] ml-[60px] text-[64px] font-bold leading-[4.5rem] text-creme"
        >
          <div
            class="absolute top-[30px] -left-[60px] -ml-[5px] h-[10px] w-[10px] rounded-full bg-creme"
          ></div>
          How decisions<br />get made
        </h1>
        <p class="mt-5 mb-[50px] max-w-3xl pl-[60px] text-lg text-gray-300">
          Snapshot is a governance protocol for <strong>D</strong>ecentralized,
          <strong>A</strong>utonomous <strong>O</strong>ganizations (DAOs).<br />
          <br />It provides flexible solutions for distributing voting rights
          and conducting all kinds of votes, such as elections or budget
          allocation, with verifiable results and guaranteed execution.
        </p>
        <div class="flex items-center">
          <hr class="w-[60px] border-skin-border" />
          <BaseButton class="origin-left scale-125 transform"
            >Discover</BaseButton
          >
        </div>

        <h1 class="relative mt-[64px] ml-6 text-md font-bold text-creme">
          <div
            class="absolute top-[10px] -left-6 -ml-1 h-2 w-2 rounded-full bg-creme"
          ></div>
          For DAOs, voting should be a snap
        </h1>
        <p class="mt-4 mb-5 max-w-md pl-6 leading-5 text-gray-300">
          Voting and creating proposals on Snapshot is user-friendly and free.
        </p>
        <div class="mb-4 flex items-center">
          <hr class="w-6 border-skin-border" />
          <BaseButton>Try the demo!</BaseButton>
        </div>
        <div class="flex items-center">
          <hr class="w-6 border-skin-border" />
          <BaseLink link="https://snapshot.org/#/setup" hide-external-icon>
            <BaseButton>Create a space</BaseButton>
          </BaseLink>
        </div>

        <h1 class="relative mt-[64px] ml-6 text-md font-bold text-creme">
          <div
            class="absolute top-[10px] -left-6 -ml-1 h-2 w-2 rounded-full bg-creme"
          ></div>
          Read
        </h1>
        <p class="mt-4 mb-5 max-w-md pl-6 leading-5 text-gray-300">
          What is Snapshot
          <BaseLink
            link="https://snapshot.org"
            class="text-snapshot"
            hide-external-icon
            >Decrypt</BaseLink
          ><br />
          Overview
          <BaseLink
            link="https://snapshot.org"
            class="text-snapshot"
            hide-external-icon
            >Daomasters</BaseLink
          >
        </p>

        <h1 class="relative mt-[64px] ml-6 text-md font-bold text-creme">
          <div
            class="absolute top-[10px] -left-6 -ml-1 h-2 w-2 rounded-full bg-creme"
          ></div>
          Explore
        </h1>
        <p class="mt-4 mb-5 max-w-md pl-6 leading-5 text-gray-300">
          Knowledge base
          <BaseLink
            link="https://snapshot.org"
            class="text-snapshot"
            hide-external-icon
            >Gitbook</BaseLink
          ><br />
          FAQ
          <BaseLink
            link="https://snapshot.org"
            class="text-snapshot"
            hide-external-icon
            >GitHub Discussions</BaseLink
          ><br />
          Source
          <BaseLink
            link="https://snapshot.org"
            class="text-snapshot"
            hide-external-icon
            >GitHub</BaseLink
          >
        </p>
      </BaseContainer>
    </div>

    <footer class="fixed right-5 bottom-4 space-x-2">
      <BaseLink
        v-for="social in socials"
        :key="social"
        :link="social.link"
        hide-external-icon
      >
        <BaseIcon
          size="22"
          class="text-skin-text opacity-40 transition-opacity hover:opacity-80"
          :name="social.icon"
        />
      </BaseLink>
    </footer>
  </div>
</template>
