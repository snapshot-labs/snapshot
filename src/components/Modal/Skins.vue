<script setup>
import { ref, computed } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { useUserSkin } from '@/composables/useUserSkin';

defineProps({
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'update:modelValue']);

const searchInput = ref('');
const { filteredSkins } = useSearchFilters();
const skins = computed(() => filteredSkins(searchInput.value));

function select(key) {
  emit('update:modelValue', key);
  emit('close');
}

const { userSkin } = useUserSkin();
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('skins') }}</h3>
    </template>
    <Search
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 md:mx-4">
      <a v-if="!searchInput" key="" @click="select(undefined)">
        <div :class="userSkin" class="bg-black rounded-none md:rounded-md">
          <Block>
            <UiButton class="mb-2" primary>{{ $t('defaultSkin') }}</UiButton>
          </Block>
        </div>
      </a>
      <a v-for="skin in skins" :key="skin.key" @click="select(skin.key)">
        <BlockSkin :skin="skin" />
      </a>
      <NoResults v-if="Object.keys(skins).length < 1" />
    </div>
  </UiModal>
</template>
