<script setup>
import { ref, computed, watch } from 'vue';
import { useUserSkin } from '@/composables/useUserSkin';
import { useSkinsFilter } from '@/composables/useSkinsFilter';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'update:modelValue']);

const searchInput = ref('');
const { filterSkins, getSkinsSpacesCount, loadingSkins } = useSkinsFilter();
const filteredSkins = computed(() => filterSkins(searchInput.value));

watch(
  () => props.open,
  () => {
    if (props.open) getSkinsSpacesCount();
  }
);

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
    <div class="mt-4 mx-0 md:mx-4 min-h-[339px]">
      <RowLoadingBlock v-if="loadingSkins" />
      <div v-else>
        <a v-if="!searchInput" key="" @click="select(undefined)">
          <div :class="userSkin" class="bg-black rounded-none md:rounded-md">
            <Block>
              <UiButton class="mb-2" primary>{{ $t('defaultSkin') }}</UiButton>
            </Block>
          </div>
        </a>
        <a v-for="skin in filteredSkins" :key="skin" @click="select(skin)">
          <BlockSkin :skin="skin" />
        </a>
        <NoResults v-if="Object.keys(filteredSkins).length < 1" />
      </div>
    </div>
  </UiModal>
</template>
