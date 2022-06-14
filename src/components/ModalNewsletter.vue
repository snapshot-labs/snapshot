<script setup lang="ts">
defineProps<{
  open: boolean;
  tag: string;
}>();

defineEmits(['close']);

const action =
  'https://snapshot.us17.list-manage.com/subscribe/post?u=1c820b717ffe37c1703e33f4b&amp;id=f11d6e5df6';
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('newsletter.stayUpToDate') }}</h3>
    </template>
    <div class="my-2 p-4">
      <form
        :action="action"
        method="post"
        target="_blank"
        autocomplete="off"
        class="space-y-1"
      >
        <input type="hidden" name="tags" :value="tag" />

        <InputEmail name="EMAIL" focus-on-mount required />

        <!-- WE will also need to handle errors and success messages -->
        <BaseButton type="submit" name="subscribe" class="w-full" primary>{{
          $t('submit')
        }}</BaseButton>
      </form>
    </div>
  </BaseModal>
</template>
