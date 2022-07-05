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
    <img
      src="/about/small_planet.png"
      class="absolute right-[490px] top-[870px]"
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
          Where decisions<br />get made
        </h1>
        <p class="mt-5 mb-[50px] max-w-3xl pl-[60px] text-lg text-gray-300">
          Snapshot is a voting protocol for DAOs. It provides flexibility on how
          voting power is calculated for a vote. Snapshot supports various
          voting types to cater to the needs of any group or organization.
        </p>
        <div class="flex items-center">
          <hr class="w-[60px] border-skin-border" />
          <router-link :to="{ path: '/' }">
            <BaseButton class="origin-left scale-125 transform"
              >Discover</BaseButton
            >
          </router-link>
        </div>

        <h1 class="relative mt-[64px] ml-[60px] text-2xl font-bold text-creme">
          <div
            class="absolute top-[20px] -left-[60px] -ml-[5px] h-[10px] w-[10px] rounded-full bg-creme"
          ></div>
          For DAOs, Voting should be a snap.
        </h1>
        <p class="mt-5 mb-[50px] max-w-3xl pl-[60px] text-lg text-gray-300">
          Creating proposals and voting on Snapshot is user-friendly and does
          not cost gas as the process is securely performed off-chain.
        </p>
        <div class="mb-4 flex items-center">
          <hr class="w-[60px] border-skin-border" />
          <BaseLink
            link="https://demo.snapshot.org/#/hamsterdao.eth/proposal/0x0630b8672c4e1f2c38e2ca6046acfdd88cc2e888053a45b0511dff2fa54b4eb1"
            hide-external-icon
          >
            <BaseButton class="origin-left scale-125 transform"
              >Try the demo!</BaseButton
            >
          </BaseLink>
        </div>
        <div class="flex items-center">
          <hr class="w-[60px] border-skin-border" />
          <BaseLink link="https://snapshot.org/#/setup" hide-external-icon>
            <BaseButton class="origin-left scale-125 transform"
              >Create a space</BaseButton
            >
          </BaseLink>
        </div>

        <h1 class="relative mt-[64px] ml-[60px] text-2xl font-bold text-creme">
          <div
            class="absolute top-[20px] -left-[60px] -ml-[5px] h-[10px] w-[10px] rounded-full bg-creme"
          ></div>
          Read
        </h1>
        <p class="mt-4 mb-5 max-w-md pl-[60px] text-lg text-gray-300">
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

        <h1 class="relative mt-[64px] ml-[60px] text-2xl font-bold text-creme">
          <div
            class="absolute top-[20px] -left-[60px] -ml-[5px] h-[10px] w-[10px] rounded-full bg-creme"
          ></div>
          Explore
        </h1>
        <p class="mt-4 mb-5 max-w-md pl-[60px] text-lg text-gray-300">
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
