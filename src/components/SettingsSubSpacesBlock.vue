<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form, getValidation } = useSpaceForm(props.context);

const parentInput = ref(form.value.parent?.id);
watch(parentInput, value => {
  form.value.parent = value || null;
});

const childrenInput = ref(form.value.children?.map(c => c.id).join(', ') || '');
watch(childrenInput, value => {
  form.value.children = value
    .split(',')
    .map(c => c.trim())
    .filter(c => c);
});
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
        v-model="parentInput"
        :is-disabled="!!form.children?.length"
        :title="$t(`settings.subspaces.parent.label`)"
        :information="$t(`settings.subspaces.parent.information`)"
        :error="getValidation('parent')"
        :placeholder="$t('settings.subspaces.parent.placeholder')"
      />

      <BaseInput
        v-model="childrenInput"
        :is-disabled="!!form.parent"
        :title="$t(`settings.subspaces.children.label`)"
        :information="$t(`settings.subspaces.children.information`)"
        :error="getValidation('children')"
        :placeholder="$t('settings.subspaces.children.placeholder')"
      />
    </div>
  </BaseBlock>
</template>
