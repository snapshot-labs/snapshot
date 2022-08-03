<script setup lang="ts">
const yearNow = new Date().getFullYear();

const snapshotTextLinks = [
  {
    text: 'about',
    link: {
      name: 'about'
    }
  },
  {
    text: 'blog',
    link: 'https://snapshot.mirror.xyz/'
  },
  {
    text: 'jobs',
    link: 'https://angel.co/company/snapshot-labs_/jobs'
  }
];

const resourcesTextLinks = [
  {
    text: 'discussions',
    link: 'https://github.com/snapshot-labs/snapshot/discussions'
  },
  {
    text: 'github',
    link: 'https://github.com/snapshot-labs'
  },
  {
    text: 'docs',
    link: 'https://docs.snapshot.org/'
  },
  {
    text: 'support',
    link: 'https://discord.snapshot.org/'
  }
];
</script>

<template>
  <div class="-mt-3 border-t" />
  <BaseContainer class="space-y-5 py-[40px] md:space-y-0">
    <div class="space-y-5 md:flex md:space-y-0">
      <div>
        <div class="mx-auto md:mx-0">
          <FooterTitle class="mb-2 text-center md:text-left">
            {{ $t('newsletter.title') }}
          </FooterTitle>

          <InputNewsletter tag="6449077" class="relative mx-auto w-[300px]" />
        </div>

        <div class="hidden md:block lg:hidden">
          <FooterSocials />
        </div>
      </div>
      <div
        class="flex justify-center space-x-[70px] text-center md:w-full md:text-left lg:ml-[60px] lg:justify-start"
      >
        <FooterLinks>
          <FooterTitle> Snapshot </FooterTitle>
          <FooterLinksItem
            v-for="item in snapshotTextLinks"
            :key="item.text"
            :link="item.link"
          >
            {{ $t(`footerView.${item.text}`) }}
            <BasePill
              v-if="item.text === 'jobs'"
              class="ml-2 inline-block !rounded px-1 py-0 text-xs"
            >
              {{ $t('footerView.hiring') }}
            </BasePill>
          </FooterLinksItem>
        </FooterLinks>

        <FooterLinks>
          <FooterTitle> {{ $t('footerView.resources') }} </FooterTitle>

          <FooterLinksItem
            v-for="item in resourcesTextLinks"
            :key="item.text"
            :link="item.link"
          >
            {{ $t(`footerView.${item.text}`) }}
          </FooterLinksItem>
        </FooterLinks>
      </div>
      <div class="pb-1 md:hidden lg:mt-0 lg:block">
        <FooterTitle class="hidden whitespace-nowrap lg:block">
          {{ $t('joinCommunity') }}
        </FooterTitle>
        <FooterSocials />
      </div>
    </div>

    <div class="whitespace-nowrap text-center opacity-40 md:text-left">
      © {{ yearNow }} Snapshot Labs.
    </div>
  </BaseContainer>
</template>
