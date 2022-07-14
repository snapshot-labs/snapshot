<script setup lang="ts">
defineProps<{
  tag: string;
}>();

defineEmits(['close']);

const action =
  'https://snapshot.us17.list-manage.com/subscribe/post?u=1c820b717ffe37c1703e33f4b&amp;id=f11d6e5df6';
</script>

<template>
  <form
    :action="action"
    method="post"
    target="_blank"
    autocomplete="off"
    class="flex"
  >
    <input type="hidden" name="tags" :value="tag" />

    <InputEmail name="EMAIL" focus-on-mount required />

    <!-- WE will also need to handle errors and success messages -->
    <BaseButton
      type="submit"
      name="subscribe"
      class="ml-2 !h-[42px] px-3 !text-sm"
      primary
    >
      {{ $t('submit') }}
    </BaseButton>
  </form>
</template>
