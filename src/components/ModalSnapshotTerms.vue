<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

defineEmits(['close']);
// TODO: Add correct TOS text
</script>

<template>
  <TuneModal size="medium" :open="open" @close="$emit('close')">
    <TuneModalTitle as="h4" class="m-3"> Term of use </TuneModalTitle>
    <div
      class="p-3 pt-0 space-y-2 max-h-[calc(100vh-130px)] md:max-h-[488px] overflow-y-auto"
    >
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias maxime
      ipsum reiciendis delectus laboriosam consequuntur ipsa, exercitationem,
      ex, quam quaerat nisi dignissimos aperiam quisquam odio totam aliquam
      necessitatibus! Natus, itaque.
      <br />
      <br />
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias maxime
      ipsum reiciendis delectus laboriosam consequuntur ipsa, exercitationem,
      ex, quam quaerat nisi dignissimos aperiam quisquam odio totam aliquam
      necessitatibus! Natus, itaque. Lorem ipsum dolor, sit amet consectetur
      adipisicing elit. Alias maxime ipsum reiciendis delectus laboriosam
      consequuntur ipsa, exercitationem, ex, quam quaerat nisi dignissimos
      aperiam quisquam odio totam aliquam necessitatibus! Natus, itaque.
      <br />
      <br />
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias maxime
      ipsum reiciendis delectus laboriosam consequuntur ipsa, exercitationem,
      ex, quam quaerat nisi dignissimos aperiam quisquam odio totam aliquam
      necessitatibus! Natus, itaque.
      <br />
      <br />
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias maxime
      ipsum reiciendis delectus laboriosam consequuntur ipsa, exercitationem,
      ex, quam quaerat nisi dignissimos aperiam quisquam odio totam aliquam
      necessitatibus! Natus, itaque.
      <br />
      <br />
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias maxime
      ipsum reiciendis delectus laboriosam consequuntur ipsa, exercitationem,
      ex, quam quaerat nisi dignissimos aperiam quisquam odio totam aliquam
      necessitatibus! Natus, itaque.
      <br />
      <br />
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias maxime
      ipsum reiciendis delectus laboriosam consequuntur ipsa, exercitationem,
      ex, quam quaerat nisi dignissimos aperiam quisquam odio totam aliquam
      necessitatibus! Natus, itaque. Lorem ipsum dolor, sit amet consectetur
      adipisicing elit. Alias maxime ipsum reiciendis delectus laboriosam
      consequuntur ipsa, exercitationem, ex, quam quaerat nisi dignissimos
      aperiam quisquam odio totam aliquam necessitatibus! Natus, itaque.
      <br />
      <br />
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias maxime
      ipsum reiciendis delectus laboriosam consequuntur ipsa, exercitationem,
      ex, quam quaerat nisi dignissimos aperiam quisquam odio totam aliquam
      necessitatibus! Natus, itaque.
    </div>
    <div class="p-3 flex gap-3">
      <TuneButton class="w-full" @click="$emit('close')"> Close </TuneButton>
    </div>
  </TuneModal>
</template>
