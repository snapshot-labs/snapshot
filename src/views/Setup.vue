<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { setPageTitle } from '@/helpers/utils';

const router = useRouter();
const tlds = ['.eth', '.xyz', '.com', '.org', '.io', '.app', '.art'];

const id = ref('');

function isValidTLD(id) {
  return tlds.some(tlds => id.endsWith(tlds));
}

function handleSubmit() {
  router.push({
    name: 'spaceSettings',
    params: { key: id.value.toLowerCase() }
  });
}

onMounted(() => {
  setPageTitle('page.title.setup');
});
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
        <UiButton
          :disabled="!isValidTLD(id)"
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
