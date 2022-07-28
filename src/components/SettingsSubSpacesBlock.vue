<script setup lang="ts">
import { ref } from 'vue';
import { useSpaceForm, useExtendedSpaces } from '@/composables';
import { watchDebounced } from '@vueuse/core';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form } = useSpaceForm(props.context);
const { loadExtentedSpaces, extentedSpaces } = useExtendedSpaces();

watchDebounced(
  form.value.parent,
  async () => {
    await loadExtentedSpaces(form.value.parent);
  },
  { debounce: 500, deep: true }
);

const childInput = ref('');
const lookingUpChild = ref(false);
const foundChild = ref(false);
const childNotFound = ref(false);
watchDebounced(
  childInput,
  async () => {
    foundChild.value = false;
    childNotFound.value = false;

    if (!childInput.value) return;
    lookingUpChild.value = true;

    await loadExtentedSpaces([childInput.value]);

    const found = extentedSpaces.value?.some(
      space => space.id === childInput.value
    );
    if (found) {
      foundChild.value = true;
    } else {
      childNotFound.value = true;
    }
    lookingUpChild.value = false;
  },
  { debounce: 500 }
);

const addChild = () => {
  if (foundChild.value) {
    form.value.children.push(childInput.value);
    childInput.value = '';
    foundChild.value = false;
    childNotFound.value = false;
  }
};

const removeChild = (child: string) => {
  form.value.children = form.value.children.filter(c => c !== child);
};
</script>

<template>
  <BaseBlock :title="$t('settings.subspaces.label')">
    <div class="space-y-2">
      <BaseMessageBlock level="info" class="mb-4">
        <i18n-t
          keypath="settings.subspaces.information"
          tag="span"
          scope="global"
        >
          <template #docs>
            <BaseLink link="https://docs.snapshot.org/spaces/sub-spaces">
              {{ $t('learnMore') }}
            </BaseLink>
          </template>
        </i18n-t>
      </BaseMessageBlock>
      <BaseInput
        v-model="form.parent"
        :is-disabled="!!form.children?.length"
        :title="$t(`settings.subspaces.parent.label`)"
        :information="$t(`settings.subspaces.parent.information`)"
        :placeholder="$t('settings.subspaces.parent.placeholder')"
        @update:model-value="
          value => (form.parent = value ? { id: value } : null)
        "
      />

      <div class="flex items-end space-x-2">
        <BaseInput
          v-model="childInput"
          :is-disabled="!!form.parent"
          :title="$t(`settings.subspaces.children.label`)"
          :information="$t(`settings.subspaces.children.information`)"
          :placeholder="$t('settings.subspaces.children.placeholder')"
        />
        <BaseButton
          :disabled="!foundChild || lookingUpChild"
          :loading="lookingUpChild"
          class="whitespace-nowrap"
          @click="addChild()"
        >
          {{
            childInput && childNotFound
              ? $t('settings.subspaces.childNotFound')
              : $t('settings.subspaces.addSubspace')
          }}
        </BaseButton>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="child in form.children"
          :key="child"
          class="rounded-3xl border px-3 py-2"
        >
          {{ child }}
          <a class="p-1 text-skin-text" @click="removeChild(child)">
            <BaseIcon name="close" />
          </a>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>
