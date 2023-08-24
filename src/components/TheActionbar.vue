<script setup lang="ts"></script>

<template>
  <Teleport to="#action-bar">
    <div class="h-[78px] border-t border-skin-border bg-skin-bg md:hidden">
      <slot />
    </div>
  </Teleport>
</template>
