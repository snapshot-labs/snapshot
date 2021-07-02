import { getProfiles } from '@/helpers/profile';
import { ref, computed, watch } from 'vue';

const profiles = ref({});

export function useProfiles() {
  const addressArray = ref([]);

  const filteredArray = computed(() =>
    addressArray.value.filter(address => {
      return !Object.keys(profiles.value).includes(address);
    })
  );

  watch(addressArray, async () => {
    console.time('getProposal.profiles');
    const response =
      filteredArray.value.length > 0
        ? await getProfiles(filteredArray.value)
        : {};
    console.timeEnd('getProposal.profiles');

    profiles.value = { ...profiles.value, ...response };
  });

  return { profiles, addressArray };
}
