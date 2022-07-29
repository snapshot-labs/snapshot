<script setup lang="ts">
import { ref } from 'vue';
import { useSpaceForm, useExtendedSpaces } from '@/composables';
import { watchDebounced } from '@vueuse/core';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form } = useSpaceForm(props.context);
const { loadExtentedSpaces, extentedSpaces } = useExtendedSpaces();

const lookingUpParent = ref(false);
const foundParent = ref(false);
const parentNotFound = ref(false);
watchDebounced(
  () => form.value.parent,
  async () => {
    foundParent.value = false;
    parentNotFound.value = false;

    if (!form.value.parent) return;

    lookingUpParent.value = true;
    await loadExtentedSpaces([form.value.parent]);

    const found = extentedSpaces.value?.some(
      space => space.id === form.value.parent
    );
    if (found) {
      foundParent.value = true;
    } else {
      parentNotFound.value = true;
    }
    lookingUpParent.value = false;
  },
  { debounce: 500, immediate: true }
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
    form.value.parent = '';
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
        :loading="lookingUpParent"
        :success="foundParent && !lookingUpParent"
        :failed="parentNotFound"
      />

      <div class="flex items-end space-x-2">
        <BaseInput
          v-model="childInput"
          :is-disabled="!!form.parent"
          :title="$t(`settings.subspaces.children.label`)"
          :information="$t(`settings.subspaces.children.information`)"
          :placeholder="$t('settings.subspaces.children.placeholder')"
          :loading="lookingUpChild"
          :failed="!!childInput && childNotFound"
        />
        <div>
          <ButtonSidebar
            class="!h-[42px] !w-[42px] whitespace-nowrap text-skin-link"
            :class="{
              'cursor-not-allowed !text-skin-text hover:border-skin-border':
                !foundChild || lookingUpChild
            }"
            @click="addChild()"
          >
            <i-ho-plus class="text-sm" />
          </ButtonSidebar>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <BasePill
          v-for="child in form.children"
          :key="child"
          class="flex gap-1 rounded-3xl border py-1 pl-2 pr-1 text-sm text-white"
        >
          {{ child }}
          <BaseButtonIcon class="p-0" @click="removeChild(child)">
            <i-ho-x class="text-xs text-white" />
          </BaseButtonIcon>
        </BasePill>
      </div>
    </div>
  </BaseBlock>
</template>
