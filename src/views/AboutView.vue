<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useSkin, DARK } from '@/composables/useSkin';

const { setPageTitle } = useI18n();
const { userTheme } = useSkin();

const themeBefore = userTheme.value;

onMounted(() => {
  userTheme.value = DARK;
  setPageTitle('Snapshot - Where decisions get made');
});

onUnmounted(() => {
  userTheme.value = themeBefore;
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
    <img
      src="/about/main.png"
      class="absolute -right-[54px] top-[56px] scale-75 2xl:top-[136px] 2xl:scale-100"
    />
    <img
      src="/about/big_planet.png"
      class="absolute right-[440px] top-[180px] scale-75 2xl:right-[640px] 2xl:scale-100"
    />
    <img
      src="/about/small_planet.png"
      class="absolute right-[370px] top-[650px] scale-75 2xl:right-[470px] 2xl:scale-100"
    />

    <nav
      id="topnav"
      class="fixed z-10 flex h-[70px] w-full items-center border-b bg-skin-bg"
    >
      <BaseContainer class="w-full pl-[50px]">
        <router-link
          :to="{ path: '/' }"
          class="flex items-center text-lg font-normal"
        >
          <BaseIcon
            size="32"
            name="snapshot"
            class="absolute left-[147px] mr-1 text-snapshot"
          />
          snapshot
        </router-link>
      </BaseContainer>
    </nav>

    <div id="content" class="flex bg-skin-bg pt-[70px]">
      <BaseContainer
        class="w-full border-l bg-gradient-to-r from-skin-bg to-transparent pl-0 font-mono"
      >
        <h1
          class="relative mt-[135px] ml-[50px] text-[40px] font-bold leading-[3rem] tracking-wider text-creme"
        >
          <div
            class="absolute top-[22px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme"
          />
          Where decisions<br />get made
        </h1>
        <p
          class="mt-4 mb-[50px] w-[501px] max-w-3xl pl-[50px] text-sm leading-5 text-gray-300 !text-skin-text"
        >
          Snapshot is the home of your community's governance. It's a place
          where you can create proposals, weigh voting power in flexable ways,
          vote completely off-chain, and finally execute decisions on-chain.
        </p>
        <div class="flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <router-link :to="{ path: '/' }">
            <BaseButton class="origin-left scale-110">Discover</BaseButton>
          </router-link>
        </div>

        <h1
          class="relative mt-[96px] ml-[50px] text-md font-bold tracking-wide text-creme"
        >
          <div
            class="absolute top-[10px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme"
          />
          For DAOs, voting should be a snap
        </h1>
        <p
          class="mt-4 mb-[50px] w-[500px] max-w-3xl pl-[50px] text-sm leading-5 text-gray-300 !text-skin-text"
        >
          Creating proposals and voting on Snapshot is user-friendly and does
          not cost gas as the process is securely performed off-chain.
        </p>
        <div class="mb-4 flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <router-link :to="{ path: '/setup' }">
            <BaseButton class="origin-left scale-110">
              Create a space
            </BaseButton>
          </router-link>
        </div>
        <div class="flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <BaseLink
            link="https://demo.snapshot.org/#/hamsterdao.eth/proposal/0x0630b8672c4e1f2c38e2ca6046acfdd88cc2e888053a45b0511dff2fa54b4eb1"
            hide-external-icon
          >
            <BaseButton class="origin-left scale-110">Try the demo</BaseButton>
          </BaseLink>
        </div>

        <h1
          class="relative mt-[96px] ml-[50px] text-md font-bold tracking-wide text-creme"
        >
          <div
            class="absolute top-[10px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme"
          />
          Read
        </h1>
        <p
          class="mt-4 mb-[50px] max-w-3xl pl-[50px] text-sm leading-6 text-gray-300 !text-skin-text"
        >
          What is Snapshot
          <BaseLink
            link="https://decrypt.co/resources/what-is-snapshot-the-decentralized-voting-system"
            class="text-snapshot"
            hide-external-icon
          >
            Decrypt
          </BaseLink>
          <br />
          Overview
          <BaseLink
            link="https://www.daomasters.xyz/tools/snapshot"
            class="text-snapshot"
            hide-external-icon
          >
            Daomasters
          </BaseLink>
        </p>

        <h1
          class="relative mt-[96px] ml-[50px] text-md font-bold tracking-wide text-creme"
        >
          <div
            class="absolute top-[10px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme"
          />
          Explore
        </h1>
        <p
          class="mt-4 mb-[50px] max-w-3xl pl-[50px] text-sm leading-6 text-gray-300 !text-skin-text"
        >
          Knowledge base
          <BaseLink
            link="https://docs.snapshot.org/"
            class="text-snapshot"
            hide-external-icon
            >Gitbook</BaseLink
          ><br />
          FAQ
          <BaseLink
            link="https://github.com/snapshot-labs/snapshot/discussions"
            class="text-snapshot"
            hide-external-icon
            >GitHub Discussions</BaseLink
          ><br />
          Source
          <BaseLink
            link="https://github.com/snapshot-labs"
            class="text-snapshot"
            hide-external-icon
            >GitHub</BaseLink
          >
        </p>
      </BaseContainer>
    </div>

    <footer class="space-x-2 p-4 sm:fixed sm:right-0 sm:bottom-0">
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
