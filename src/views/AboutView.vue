<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useSkin, DARK } from '@/composables/useSkin';
import { useApp } from '@/composables/useApp';

const { setPageTitle } = useI18n();
const { userTheme } = useSkin();
const { env } = useApp();

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
    <div class="hidden md:block">
      <img
        src="/about/main.png"
        class="absolute -top-[0px] -right-[108px] scale-50 lg:top-[36px] lg:-right-[54px] lg:scale-75 2xl:top-[136px] 2xl:scale-100"
      />
      <img
        src="/about/big_planet.png"
        class="absolute top-[160px] right-[240px] scale-50 lg:right-[440px] lg:top-[160px] lg:scale-75 2xl:right-[640px] 2xl:scale-100"
      />
      <img
        src="/about/small_planet.png"
        class="absolute right-[250px] top-[460px] scale-50 lg:right-[370px] lg:top-[620px] lg:scale-75 2xl:right-[470px] 2xl:scale-100"
      />
    </div>

    <nav
      id="topnav"
      class="fixed z-10 flex h-[70px] w-full items-center border-b bg-skin-bg"
    >
      <BaseContainer class="w-full pl-[50px]">
        <router-link
          :to="{ path: '/' }"
          class="flex items-center text-lg font-normal"
        >
          <BaseIcon size="32" name="snapshot" class="mr-2 text-snapshot" />
          snapshot
        </router-link>
      </BaseContainer>
    </nav>

    <div id="content" class="flex h-full min-h-screen bg-skin-bg pt-[40px]">
      <BaseContainer
        class="w-full border-l bg-gradient-to-r from-skin-bg to-transparent pl-0"
      >
        <h1
          class="relative ml-[50px] mt-[100px] font-space text-[40px] font-bold leading-[3rem] text-white md:mt-[135px]"
        >
          <div
            class="absolute top-[22px] -left-[50px] -ml-[5px] h-2 w-2 rounded-full bg-white"
          />
          Where decisions<br />get made
        </h1>
        <p
          class="mt-4 mb-[50px] pl-[50px] text-gray-300 !text-skin-text sm:w-[501px]"
        >
          {{ $t('aboutPage.description') }}
        </p>
        <div class="flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <router-link :to="{ path: '/' }">
            <BaseButton class="origin-left scale-110">Discover</BaseButton>
          </router-link>
        </div>

        <AboutSubheader>
          {{ $t('aboutPage.subHeader') }}
        </AboutSubheader>
        <p
          class="mt-4 mb-[50px] pl-[50px] text-gray-300 !text-skin-text sm:w-[500px]"
        >
          {{ $t('aboutPage.subDescription') }}
        </p>
        <div class="mb-4 flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <router-link :to="{ path: '/setup' }">
            <BaseButton class="origin-left scale-110">
              Create a space
            </BaseButton>
          </router-link>
        </div>
        <div v-if="env !== 'demo'" class="flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <BaseLink
            link="https://demo.snapshot.org/#/hamsterdao.eth/proposal/0x0630b8672c4e1f2c38e2ca6046acfdd88cc2e888053a45b0511dff2fa54b4eb1"
            hide-external-icon
          >
            <BaseButton class="origin-left scale-110">Try the demo</BaseButton>
          </BaseLink>
        </div>

        <AboutSubheader> Read </AboutSubheader>
        <p class="mt-4 mb-[50px] pl-[50px] text-gray-300 !text-skin-text">
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
        <AboutSubheader> Explore </AboutSubheader>
        <p class="mt-4 mb-[50px] pl-[50px] text-gray-300 !text-skin-text">
          Knowledge base
          <BaseLink
            link="https://docs.snapshot.org/"
            class="text-snapshot"
            hide-external-icon
          >
            Gitbook
          </BaseLink>
          <br />
          FAQ
          <BaseLink
            link="https://github.com/snapshot-labs/snapshot/discussions"
            class="text-snapshot"
            hide-external-icon
          >
            GitHub Discussions
          </BaseLink>
          <br />
          Source
          <BaseLink
            link="https://github.com/snapshot-labs"
            class="text-snapshot"
            hide-external-icon
          >
            GitHub
          </BaseLink>
        </p>
        <AboutSubheader> Newsletter </AboutSubheader>
        <div class="mt-4 mb-[50px] pl-[50px]">
          <div class="mb-2">
            {{ $t('newsletter.title') }}
          </div>
          <InputNewsletter tag="6449077" class="relative w-[300px]" />
        </div>
      </BaseContainer>
    </div>

    <footer
      class="space-x-3 bg-skin-bg pb-[50px] pl-[50px] md:fixed md:right-0 md:bottom-0 md:bg-transparent md:p-4 2xl:pr-6"
    >
      <BaseLink
        v-for="social in socials"
        :key="social"
        :link="social.link"
        hide-external-icon
      >
        <BaseIcon
          size="28"
          class="text-skin-text opacity-40 transition-opacity hover:opacity-80"
          :name="social.icon"
        />
      </BaseLink>
    </footer>
  </div>
</template>
