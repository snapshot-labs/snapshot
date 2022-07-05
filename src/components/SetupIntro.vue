<script setup lang="ts"></script>

<template>
  <h4>Introduction</h4>
  A snapshot space is...
  <SetupMessageHelp />
  <BaseButton
    primary
    class="float-right mt-4"
    @click="$router.push({ query: { step: 2 } })"
  >
    Next
  </BaseButton>
</template>
