<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

defineEmits(['close', 'proceed']);
</script>

<template>
  <BaseModal :open="open" hide-close @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('attention') }}</h3>
      </div>
    </template>

    <BaseMessageBlock level="warning" class="m-5 mt-4 text-red">
      {{ $t('warningSpace') }}
      <BaseLink link="https://docs.snapshot.org/">{{
        $t('learnMore')
      }}</BaseLink>
    </BaseMessageBlock>
    <template #footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton class="w-full" @click="$router.push('/'), $emit('close')">
          {{ $t('buttonGoBack') }}
        </BaseButton>
      </div>

      <div class="float-left w-2/4 pl-2">
        <BaseButton
          class="w-full"
          primary
          @click="$emit('proceed'), $emit('close')"
        >
          {{ $t('buttonUnderstand') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
