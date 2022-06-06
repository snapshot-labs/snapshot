import { ref } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const spaceObject = {
  strategies: [],
  categories: [],
  admins: [],
  members: [],
  plugins: {},
  filters: {
    minScore: 0,
    onlyMembers: false
  },
  voting: {
    delay: 0,
    hideAbstain: false,
    period: 0,
    quorum: 0,
    type: ''
  },
  validation: { name: 'basic', params: {} },
  name: '',
  about: '',
  avatar: '',
  network: '',
  symbol: '',
  terms: '',
  website: '',
  twitter: '',
  github: '',
  private: false,
  domain: '',
  skin: ''
};

const form = ref(clone(spaceObject));

export function useSpaceSettingsForm() {
  return { form };
}
