<script setup lang="ts"></script>

<template>
  <BaseContainer class="mb-4 !px-0 md:!px-4">
    <BaseMessageBlock is-responsive level="warning-red">
      {{ $t('warningSpace') }}
      <BaseLink link="https://docs.snapshot.org/spaces/badges-and-warnings">{{
        $t('learnMore')
      }}</BaseLink>
    </BaseMessageBlock>
  </BaseContainer>
</template>
