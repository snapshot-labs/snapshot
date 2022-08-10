<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import debounce from 'lodash/debounce';

const router = useRouter();
const route = useRoute();

function handleInput(e) {
  const input = e.target.value;

  const { query } = router.currentRoute.value;
  router.push({
    query: input ? { ...query, q: input } : { ...query, q: undefined }
  });
}

const handleInputDebounce = debounce(handleInput, 500);

function clearInput() {
  const { query } = router.currentRoute.value;
  router.push({ query: { ...query, q: undefined } });
}
</script>

<template>
  <div
    class="group -ml-3 -mb-1 flex w-full max-w-[360px] items-center rounded-full"
  >
    <i-ho-search class="mr-2 text-[20px] group-focus-within:text-skin-link" />
    <input
      :value="route.query.q"
      placeholder="Search"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="input w-full flex-auto border-none text-[20px]"
      @input="handleInputDebounce"
      @click="route.name !== 'home' ? router.push({ name: 'home' }) : null"
    />
    <BaseButtonIcon @click="clearInput">
      <i-ho-x v-if="route.query.q" class="text-sm" />
    </BaseButtonIcon>
  </div>
</template>
