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
    <nav id="topnav" class="fixed z-10 w-full border-b bg-skin-bg">
      <BaseContainer class="pl-0 pr-3 sm:!px-4">
        <div class="flex items-center py-[12px]">
          <div class="ml-3 flex flex-auto items-center">
            <router-link
              :to="{ path: '/' }"
              class="flex items-center text-xl sm:-ml-3"
              style="font-size: 24px"
            >
              <BaseIcon size="36" name="snapshot" class="text-snapshot" />
              snapshot
            </router-link>
          </div>
        </div>
      </BaseContainer>
    </nav>
    <div id="content" class="flex bg-skin-bg pt-6">
      <BaseContainer
        class="grow border-l bg-gradient-to-r from-skin-bg to-transparent pl-0 font-mono"
      >
        <h1 class="relative mt-[80px] ml-6 text-2xl font-bold text-creme">
          <div
            class="absolute top-[22px] -left-6 -ml-1 h-2 w-2 rounded-full bg-creme"
          ></div>
          Where decisions<br />get made
        </h1>
        <p class="mt-4 mb-5 max-w-md pl-6 leading-5 text-gray-300">
          Snapshot is a voting protocol for DAOs. It provides flexibility on how
          voting power is calculated for a vote. Snapshot supports various
          voting types to cater to the needs of any group or organization.
        </p>
        <div class="flex items-center">
          <hr class="w-6 border-skin-border" />
          <BaseButton>Discover</BaseButton>
        </div>

        <h1 class="relative mt-[64px] ml-6 text-md font-bold text-creme">
          <div
            class="absolute top-[10px] -left-6 -ml-1 h-2 w-2 rounded-full bg-creme"
          ></div>
          For DAOs, voting should be a snap
        </h1>
        <p class="mt-4 mb-5 max-w-md pl-6 leading-5 text-gray-300">
          Creating proposals and voting on Snapshot is user-friendly and does
          not cost gas as the process is securely performed off-chain.
        </p>
        <div class="flex items-center">
          <hr class="w-6 border-skin-border" />
          <BaseButton>Create a space</BaseButton>
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

<style scoped>
#content {
  background-image: url('/about/main.png'), url('/about/big_planet.png'),
    url('/about/small_planet.png');
  background-position: 100% 100px, calc(100% - 550px) 200px,
    calc(100% - 450px) 800px;
  background-repeat: no-repeat;
}
</style>
