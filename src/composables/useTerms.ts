import { ref, computed } from 'vue';
import { lsSet, lsGet } from '@/helpers/utils';
import { useRoute } from 'vue-router';

export function useTerms() {
  const route = useRoute();

  const key = computed(() => route.params.key);

  const modalTermsOpen = ref(false);
  const acceptedSpaces = ref(JSON.parse(lsGet('acceptedTerms', '[]')));
  const termsAccepted = ref(acceptedSpaces.value.includes(key.value));

  function acceptTerms() {
    acceptedSpaces.value.push(key.value);
    lsSet('acceptedTerms', JSON.stringify(acceptedSpaces.value));
    termsAccepted.value = true;
  }

  return { modalTermsOpen, termsAccepted, acceptTerms };
}
