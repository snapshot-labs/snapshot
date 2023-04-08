<script setup>
const { userTheme } = useSkin();
const { env } = useApp();

const themeBefore = userTheme.value;

onMounted(() => {
  userTheme.value = DARK;
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
    link: 'https://discord.snapshot.org/'
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
        class="absolute -right-[108px] -top-[0px] scale-50 lg:-right-[54px] lg:top-[36px] lg:scale-75 2xl:top-[136px] 2xl:scale-100"
      />
      <img
        src="/about/big_planet.png"
        class="absolute right-[240px] top-[160px] scale-50 lg:right-[440px] lg:top-[160px] lg:scale-75 2xl:right-[640px] 2xl:scale-100"
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
            class="absolute -left-[50px] top-[22px] -ml-[5px] h-2 w-2 rounded-full bg-white"
          />
          Where decisions<br />get made
        </h1>
        <p
          class="mb-[50px] mt-4 pl-[50px] !text-skin-text text-gray-300 sm:w-[501px]"
        >
          {{ $t('aboutPage.description') }}
        </p>
        <div class="flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <router-link :to="{ path: '/' }">
            <BaseButton tabindex="-1" class="origin-left scale-110"
              >Discover</BaseButton
            >
          </router-link>
        </div>

        <AboutSubheader>
          {{ $t('aboutPage.subHeader') }}
        </AboutSubheader>
        <p
          class="mb-[50px] mt-4 pl-[50px] !text-skin-text text-gray-300 sm:w-[500px]"
        >
          {{ $t('aboutPage.subDescription') }}
        </p>
        <div class="mb-4 flex items-center">
          <hr class="w-[50px] border-skin-border" />
          <router-link :to="{ path: '/setup' }">
            <BaseButton tabindex="-1" class="origin-left scale-110">
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
            <BaseButton tabindex="-1" class="origin-left scale-110"
              >Try the demo</BaseButton
            >
          </BaseLink>
        </div>

        <AboutSubheader> Read </AboutSubheader>
        <p class="mb-[50px] mt-4 pl-[50px] !text-skin-text text-gray-300">
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
        <p class="mb-[50px] mt-4 pl-[50px] !text-skin-text text-gray-300">
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
        <div class="mb-[50px] mt-4 pl-[50px]">
          <div class="mb-2">
            {{ $t('newsletter.title') }}
          </div>
          <InputNewsletter tag="6449077" class="relative w-[300px]" />
        </div>
      </BaseContainer>
    </div>

    <footer
      class="space-x-3 bg-skin-bg pb-[50px] pl-[50px] md:fixed md:bottom-0 md:right-0 md:bg-transparent md:p-4 2xl:pr-6"
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
