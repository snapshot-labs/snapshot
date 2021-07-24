<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const id = ref('');

function handleSubmit() {
  router.push({
    name: 'settings',
    params: { key: id.value.toLowerCase() }
  });
}
</script>

<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link :to="{ name: 'home' }" class="text-color">
          <Icon name="back" size="22" class="v-align-middle" />
          {{ $t('backToHome') }}
        </router-link>
      </div>
      <div class="px-4 px-md-0">
        <h1 v-text="$t('setup.createASpace')" class="mb-4" />
      </div>
      <Block>
        <div class="mb-3">
          {{ $t('setup.useExistingEns') }}
        </div>
        <UiButton class="text-left width-full mb-3 d-flex px-3">
          <input
            v-model="id"
            class="input flex-auto"
            :placeholder="$t('setup.example')"
          />
          <a
            class="d-block py-1 mr-n2"
            target="_blank"
            href="https://docs.snapshot.org/spaces/create"
          >
            <Icon name="info" size="24" class="text-color p-1" />
          </a>
        </UiButton>
        <UiButton
          :disabled="!id.includes('.eth') && !id.includes('.xyz')"
          @click="handleSubmit"
          class="button--submit width-full"
        >
          {{ $t('next') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>
