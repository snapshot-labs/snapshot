<script setup>
import { computed } from 'vue';
import { useApp } from '@/composables/useApp';
import { useRoute } from 'vue-router';
import { useDomain } from '@/composables/useDomain';

const route = useRoute();
const { domain } = useDomain();
const { spaces } = useApp();

const spaceId = computed(() => domain || route.params.key);
const space = computed(() => spaces.value[spaceId.value]);

const from = computed(() => route.params.from);
const spaceFrom = computed(() => spaces.value[from.value]);
</script>

<template>
  <router-view
    :spaceId="spaceId"
    :space="space"
    :from="from"
    :spaceFrom="spaceFrom"
  ></router-view>
</template>
