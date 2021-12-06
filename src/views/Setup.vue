<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useEns } from '@/composables/useEns';
import { useWeb3 } from '@/composables/useWeb3';

const { web3 } = useWeb3();
const web3Account = computed(() => web3.value.account);

const router = useRouter();
const { getEnsNames } = useEns();

const id = ref('');
const loading = ref(false);
const domains = ref(null);

function applyEns(ens) {
  id.value = ens;
}

function loadEns() {
  loading.value = true;
  getEnsNames()
    .then(res => {
      domains.value = res.account?.domains.slice(0, 5);
    })
    .finally(() => (loading.value = false));
}

loadEns();
watch(web3Account, loadEns);

function handleSubmit() {
  router.push({
    name: 'spaceSettings',
    params: { key: id.value.toLowerCase() }
  });
}
</script>

<template>
  <Layout>
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link :to="{ path: '/' }" class="text-color">
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('backToHome') }}
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 v-text="$t('setup.createASpace')" class="mb-4" />
      </div>
      <Block>
        <div class="mb-3">
          {{ $t('setup.useExistingEns') }}
        </div>

        <UiButton class="text-left w-full mb-3 flex px-3">
          <input
            v-model="id"
            class="input flex-auto"
            :placeholder="$t('setup.example')"
          />
          <a
            class="block py-1 -mr-2"
            target="_blank"
            href="https://docs.snapshot.org/spaces/create"
          >
            <Icon name="info" size="24" class="text-color p-1" />
          </a>
        </UiButton>
        <RowLoading v-if="loading" />
        <div v-if="domains && !loading">
          <span>{{ $t('setup.suggestions') }}: </span>
          <ul class="inline">
            <li
              class="inline cursor-pointer"
              v-for="(ens, i) in domains"
              :key="i"
              @click="applyEns(ens.name)"
              role="button"
            >
              <a>
                {{ ens.name }}<span v-if="i + 1 < domains.length">, </span>
              </a>
            </li>
          </ul>
        </div>
        <div v-else-if="!domains && !loading">
          {{ $t('setup.noEns') }}
        </div>
        <UiButton
          :disabled="!id.includes('.eth') && !id.includes('.xyz')"
          @click="handleSubmit"
          class="w-full mt-2"
          primary
        >
          {{ $t('next') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>
