<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const route = useRoute();
const { web3, web3Account } = useWeb3();
const { modalAccountOpen } = useModal();
const { setPageTitle } = useI18n();

onMounted(() => {
  setPageTitle('page.title.setup');
});
</script>

<template>
  <TheLayout>
    <template #content-left>
      <div class="px-4 md:px-0">
        <h1 class="mb-4" v-text="$t('setup.createASpace')" />
      </div>
      <template v-if="web3Account || web3.authLoading">
        <!-- Step one - setup ens domain -->
        <SetupDomain v-if="!route.params.step" />
        <!-- Step two - setup space controller -->
        <SetupController
          v-else-if="route.params.step === 'controller' && route.params.ens"
          :web3-account="web3Account"
        />
        <!-- Step three - setup space profile -->
        <SetupProfile
          v-else-if="route.params.step === 'profile' && route.params.ens"
          :web3-account="web3Account"
        />
      </template>
      <BaseBlock v-else>
        <BaseButton class="w-full" primary @click="modalAccountOpen = true">
          {{ $t('connectWallet') }}
        </BaseButton>
      </BaseBlock>
    </template>
    <template #sidebar-right>
      <BaseBlock class="mt-4 text-skin-text">
        <BaseIcon
          name="gitbook"
          size="24"
          class="pr-2 !align-middle text-skin-text"
        />
        <i18n-t keypath="setup.helpDocsAndDiscordLinks" tag="span">
          <template #docs>
            <BaseLink link="https://docs.snapshot.org/spaces/create">
              documentation</BaseLink
            >
          </template>
          <template #discord>
            <BaseLink link="https://discord.gg/snapshot"> Discord</BaseLink>
          </template>
        </i18n-t>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
