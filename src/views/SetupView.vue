<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

const route = useRoute();
const router = useRouter();
const { web3, web3Account } = useWeb3();
const { modalAccountOpen } = useModal();
const { setPageTitle } = useI18n();

onMounted(() => {
  if (!route.query.step) router.push({ query: { step: 1 } });
  setPageTitle('page.title.setup');
});

const currentStep = computed(() => Number(route.query.step));
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SetupStepper class="mt-[62px]" :current-step="currentStep" />
    </template>
    <template #content-right>
      <div class="px-4 md:px-0">
        <h1 class="mb-4" v-text="$t('setup.createASpace')" />
      </div>
      <template v-if="web3Account || web3.authLoading">
        <SetupIntro v-if="currentStep === 1" />

        <SetupDomain v-if="currentStep === 2" />

        <SetupController
          v-else-if="currentStep === 3 && route.params.ens"
          :web3-account="web3Account"
        />

        <SetupProfile
          v-else-if="currentStep === 4 && route.params.ens"
          :web3-account="web3Account"
        />
      </template>
      <BaseBlock v-else>
        <BaseButton class="w-full" primary @click="modalAccountOpen = true">
          {{ $t('connectWallet') }}
        </BaseButton>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
