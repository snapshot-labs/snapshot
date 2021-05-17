import { ref } from 'vue';
import { lsSet, lsGet } from '@/helpers/utils';

export function useTerms(spaceKey) {
  const modalTermsOpen = ref(false);
  const acceptedSpaces = ref(JSON.parse(lsGet('acceptedTerms', '[]')));
  const termsAccepted = ref(acceptedSpaces.value.includes(spaceKey));

  function acceptTerms() {
    acceptedSpaces.value.push(spaceKey);
    lsSet('acceptedTerms', JSON.stringify(acceptedSpaces.value));
    termsAccepted.value = true;
  }

  return { modalTermsOpen, termsAccepted, acceptTerms };
}
