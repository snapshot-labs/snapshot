import sign, { DataType } from '@/helpers/sign';
import { createFetch } from '@vueuse/core';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

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

const useEmailFetch = createFetch({
  baseUrl: import.meta.env.VITE_ENVELOP_URL,
  options: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

export function useEmailFetchClient() {
  const { web3Account } = useWeb3();

  function plainSign(message, typesSchema) {
    const { web3 } = getInstance();

    return sign(web3, web3Account.value, message, typesSchema);
  }

  const fetchSubscriptionsDetails = body => {
    return useEmailFetch('/subscriber').post(body).json();
  };

  const subscribeWithEmail = async unsignedParams => {
    let signature;
    try {
      signature = await plainSign(unsignedParams, SubscribeSchema);
    } catch (error: any) {
      return {
        error: { value: 'sign_error' },
        data: { value: null }
      };
    }
    const body = {
      method: 'snapshot.subscribe',
      params: {
        ...unsignedParams,
        signature
      }
    };

    return useEmailFetch('/').post(body).json();
  };

  const updateEmailSubscriptions = async unsignedParams => {
    let signature;
    try {
      signature = await plainSign(unsignedParams, UpdateSubscriptionsSchema);
    } catch (error: any) {
      return {
        error: { value: 'sign_error' },
        data: { value: null }
      };
    }
    const body = {
      method: 'snapshot.update',
      params: {
        ...unsignedParams,
        signature
      }
    };

    return useEmailFetch('/').post(body).json();
  };

  return {
    fetchSubscriptionsDetails,
    subscribeWithEmail,
    updateEmailSubscriptions
  };
}
