<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { shorten } from '@/helpers/utils';

const props = defineProps<{ space: ExtendedSpace; proposal?: Proposal }>();

const route = useRoute();
const { domain } = useApp();

const pages = computed(() => {
  let pages: any = [];
  const spaceRoute = `/${props.space.id}`;
  const basePages = [
    { name: domain ? 'Home' : props.space.name, to: spaceRoute, current: false }
  ];

  if (route.name === 'spaceProposal') {
    const id = route.params.id as string;
    pages = [
      ...basePages,
      {
        id: 'proposal-title',
        name: props.proposal?.title,
        to: `${spaceRoute}/proposal/${id}`,
        current: true
      }
    ];
  }

  if (route.name === 'spaceDelegate') {
    const delegate = route.params.address as string;
    pages = [
      ...basePages,
      {
        name: 'Delegates',
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

  if (route.name === 'spaceBoost') {
    const id = route.params.proposalId as string;
    pages = [
      ...basePages,
      {
        name: props.proposal?.title,
        to: `${spaceRoute}/proposal/${id}`,
        current: false
      },
      { name: 'New boost', current: true }
    ];
  }

  pages = pages.filter((page: any) => page.name);

  return pages;
});
</script>

<template>
  <BaseBreadcrumbs
    :pages="pages"
    class="px-[20px] md:px-4 -mt-1 pb-[16px] lg:pb-[20px]"
  />
</template>
