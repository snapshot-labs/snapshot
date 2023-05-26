import sign, { DataType } from '@/helpers/sign';
import { createFetch } from '@vueuse/core';

const SubscribeSchema: DataType = {
  Subscribe: [
    { name: 'address', type: 'address' },
    { name: 'email', type: 'string' }
  ]
};

const UpdateSubscriptionsSchema: DataType = {
  Subscriptions: [
    { name: 'address', type: 'address' },
    { name: 'email', type: 'string' },
    { name: 'subscriptions', type: 'string[]' }
  ]
};

export const useEmailFetch = createFetch({
  baseUrl: import.meta.env.VITE_ENVELOP_URL,
  options: {
    headers: {
      'Content-Type': 'application/json'
    },
  }
});

export function useEmailFetchClient() {
  function signWithAlias(message, typesSchema) {
    const { aliasWallet, actionWithAlias } = useAliasAction();

    return actionWithAlias(() => {
      const wallet = aliasWallet.value;
      const address = aliasWallet.value.address;
      return sign(wallet, address, message, typesSchema);
    });
  }

  const fetchSubscriptions = (body) => {
    return useEmailFetch('/subscriber', {
      method: 'POST'
    }).post(body).json();
  };

  const subscribeWithEmail = async (unsignedParams) => {
    const signature = await signWithAlias(unsignedParams, SubscribeSchema);
    const body = {
      method: 'snapshot.subscribe',
      params: {
        ...unsignedParams,
        signature
      }
    }
    
    return useEmailFetch('/', {
      method: 'POST'
    }).post(body).json();
  };

  const updateEmailSubscriptions = async (unsignedParams) => {
    const signature = await signWithAlias(unsignedParams, UpdateSubscriptionsSchema);
    const body = {
      method: 'snapshot.update',
      params: {
        ...unsignedParams,
        signature
      }
    }
    
    return useEmailFetch('/', {
      method: 'POST'
    }).post(body).json();
  };

  return {
    fetchSubscriptions,
    subscribeWithEmail,
    updateEmailSubscriptions
  };
}
