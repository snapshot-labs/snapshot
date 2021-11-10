<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEns } from '@/composables/useEns';

const router = useRouter();
const { getEnsNames } = useEns();

const id = ref('');
const domains = ref([]);

function applyEns(ens) {
  id.value = ens;
}

getEnsNames().then(res => {
  domains.value = res.account.domains.slice(0, 5);
});

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
        <UiButton class="text-left w-full mb-1 flex px-3">
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
        <div class="mb-3">
          <span>Suggestions: </span>
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
        <UiButton
          :disabled="!id.includes('.eth') && !id.includes('.xyz')"
          @click="handleSubmit"
          class="w-full"
          primary
        >
          {{ $t('next') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>
