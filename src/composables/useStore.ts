import { reactive, ref } from 'vue';

const store = reactive({
  space: {
    proposals: [],
    filterBy: 'all'
  },
  timeline: {
    proposals: [],
    filterBy: 'all'
  }
});

const notifications = ref<
  {
    id: string;
    event: string;
    time: number;
    title: string;
    spaceId?: string;
  }[]
>([]);

export function useStore() {
  return { store, notifications };
}
