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

    <InputEmail name="EMAIL" required>
      <button
        type="submit"
        name="subscribe"
        class="absolute right-0 h-[42px] rounded-r-full px-3"
      >
        <i-ho-paper-airplane class="rotate-90 text-white" />
      </button>
    </InputEmail>
  </form>
</template>
