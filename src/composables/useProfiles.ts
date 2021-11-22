import { getProfiles } from '@/helpers/profile';
import { ref } from 'vue';

const profiles = ref({});

export function useProfiles() {
  
  const loadProfiles = async (addresses: string[]) => {
    const addressesToAdd = addresses.filter(
      address => !Object.keys(profiles.value).includes(address)
    );

    console.time('getProfiles');
    const response =
      addressesToAdd.length > 0
        ? await getProfiles(addressesToAdd)
        : {};
    console.timeEnd('getProfiles');

    profiles.value = { ...profiles.value, ...response };
  };

  return {
    profiles,
    loadProfiles
  };
}
