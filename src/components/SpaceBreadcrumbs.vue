<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { shorten } from '@/helpers/utils';

const props = defineProps<{ space: ExtendedSpace; proposal?: Proposal }>();

const route = useRoute();

const pages = computed(() => {
  let pages: any = [];
  const spaceRoute = `/${props.space.id}`;
  const basePages = [
    { name: props.space.name, to: spaceRoute, current: false }
  ];

  if (route.name === 'spaceProposal') {
    const id = route.params.id as string;
    pages = [
      ...basePages,
      {
        name: `${props.proposal?.title.slice(0, 24)}...`,
        to: `${spaceRoute}/proposal/${id}`,
        current: true
      }
    ];
  }

  if (route.name === 'spaceDelegate') {
    const delegate = route.params.address as string;
    pages = [
      {
        name: props.space.name,
        to: `${spaceRoute}/delegates`,
        current: false
      },
      {
        name: shorten(delegate),
        to: `${spaceRoute}/delegate/${delegate}`,
        current: true
      }
    ];
  }

  pages = pages.filter((page: any) => page.name);

  return pages;
});
</script>

<template>
  <BaseBreadcrumbs :pages="pages" />
</template>
