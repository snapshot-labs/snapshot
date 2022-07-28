<script setup lang="ts">
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form, getValidation } = useSpaceForm(props.context);
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
        :model-value="form.parent?.id || ''"
        :is-disabled="!!form.children?.length"
        :title="$t(`settings.subspaces.parent.label`)"
        :information="$t(`settings.subspaces.parent.information`)"
        :error="getValidation('parent')"
        :placeholder="$t('settings.subspaces.parent.placeholder')"
        @update:model-value="
          value => (form.parent = value ? { id: value } : null)
        "
      />

      <BaseInput
        :model-value="form.children?.map(c => c.id).join(', ') || ''"
        :is-disabled="!!form.parent"
        :title="$t(`settings.subspaces.children.label`)"
        :information="$t(`settings.subspaces.children.information`)"
        :error="getValidation('children')"
        :placeholder="$t('settings.subspaces.children.placeholder')"
        @update:model-value="
          value =>
            (form.children = value
              ? value.split(', ').map(c => ({ id: c.trim() }))
              : [])
        "
      />
    </div>
  </BaseBlock>
</template>
