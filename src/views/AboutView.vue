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
  <div class="bg-skin-bg">
    <img
      src="/about/main.png"
      class="absolute right-0 top-[170px] hidden w-[33vw] min-w-[200px] max-w-[424px] sm:block"
    />
    <img
      src="/about/big_planet.png"
      class="absolute right-[200px] top-[500px] hidden w-[10vw] min-w-[100px] max-w-[135px] sm:block md:right-[600px] md:top-[150px] xl:right-[680px] xl:top-[230px]"
    />
    <img
      src="/about/small_planet.png"
      class="absolute right-[150px] top-[850px] hidden sm:block md:right-[400px] md:top-[700px] xl:right-[490px] xl:top-[870px]"
    />

    <nav
      id="topnav"
      class="fixed z-10 flex h-[70px] w-full items-center border-b bg-skin-bg"
    >
      <BaseContainer class="w-full !max-w-[1200px] pl-4 sm:pl-[50px]">
        <router-link :to="{ path: '/' }" class="flex items-center text-lg">
          <BaseIcon size="32" name="snapshot" class="mr-1 text-snapshot" />
          snapshot
        </router-link>
      </BaseContainer>
    </nav>

    <div id="content" class="flex pt-[70px] pl-0 sm:pl-6">
      <BaseContainer class="w-full !max-w-[1200px] border-l pl-0 font-mono">
        <h1
          class="relative ml-4 mt-5 text-2xl font-bold leading-[2.75rem] text-creme sm:ml-[50px] sm:text-[50px] sm:leading-[4rem] md:mt-[250px] xl:mt-[135px]"
        >
          <div
            class="absolute top-[20px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme sm:top-[30px]"
          ></div>
          Where decisions<br />get made
        </h1>
        <p
          class="mt-4 mb-[50px] w-full pl-4 text-base leading-5 text-gray-300 sm:max-w-[60vw] sm:pl-[50px] sm:text-md sm:leading-6 md:max-w-3xl"
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
          class="relative mt-[96px] ml-4 text-lg font-bold text-creme sm:ml-[50px]"
        >
          <div
            class="absolute top-[12px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme"
          ></div>
          For DAOs, Voting should be a snap
        </h1>
        <p
          class="mt-4 mb-[50px] w-full max-w-3xl pl-4 text-base leading-5 text-gray-300 sm:w-[600px] sm:pl-[50px] sm:text-md sm:leading-6"
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
          class="relative mt-[96px] ml-4 text-lg font-bold text-creme sm:ml-[50px]"
        >
          <div
            class="absolute top-[12px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme"
          ></div>
          Read
        </h1>
        <p
          class="mt-4 mb-[50px] max-w-3xl pl-4 text-base leading-5 text-gray-300 sm:pl-[50px] sm:text-md sm:leading-6"
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
          class="relative mt-[96px] ml-4 text-lg font-bold text-creme sm:ml-[50px]"
        >
          <div
            class="absolute top-[12px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-creme"
          ></div>
          Explore
        </h1>
        <p
          class="mt-4 mb-[100px] max-w-3xl pl-4 text-base leading-5 text-gray-300 sm:mb-[50px] sm:pl-[50px] sm:text-md sm:leading-6"
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
