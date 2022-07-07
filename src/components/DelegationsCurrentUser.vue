<script setup lang="ts">
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useClient } from '@/composables/useClient';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useProfiles } from '@/composables/useProfiles';
import {
  MY_DELEGATIONS_QUERY,
  MY_DELEGATORS_QUERY,
  SPACE_DELEGATIONS_REQUEST
} from '@/helpers/queries';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { apolloQuery } = useApolloQuery();
const { profiles } = useProfiles();
const props = defineProps<{
  space: string;
  currentAccount: string;
}>();

const { notify } = useFlashNotification();
const { send } = useClient();
const { t } = useI18n();

const myDelegationsData: any = ref([]);
const myDelegatorsData: any = ref([]);

onMounted(async () => {
  const mydelegations: any = await apolloQuery(
    {
      query: MY_DELEGATIONS_QUERY,
      variables: {
        first: 1000,
        skip: 0,
        space: props.space,
        delegator: props.currentAccount
      }
    },
    'delegations'
  );
  console.log(mydelegations);
  const mydelegators: any = await apolloQuery(
    {
      query: MY_DELEGATORS_QUERY,
      variables: {
        first: 1000,
        skip: 0,
        space: props.space,
        delegate: props.currentAccount
      }
    },
    'delegations'
  );
  console.log(mydelegators);

  myDelegationsData.value = mydelegations.map(a => a.delegate);
  myDelegatorsData.value = mydelegators.map(a => a.delegator);
});

const delegateTo = async (delegate, requestID) => {
  console.log(delegate);
  try {
    await send(props.space, 'delegateTo', {
      delegate,
      space: props.space,
      requestID
    });
    return notify(['green', t('notify.saved')]);
  } catch (error) {
    console.log('error', error);
    return notify(['red', 'Something went wrong']);
  }
};
</script>

<template>
  Select a delegate to represent you. You can change this at any time. You can
  delegate to someone not listed, by entering an ENS name or Ethereum address
  <div v-if="myDelegationsData.length > 0">
    <h4>My Delegations:</h4>
    <div v-for="delegation in myDelegationsData" :key="delegation">
      <div>
        <BaseUser
          class=""
          :address="delegation"
          :profile="profiles[delegation]"
        />
      </div>
    </div>
  </div>
  <div v-if="myDelegatorsData.length > 0">
    <h4>My Delegators:</h4>
    <div v-for="delegation in myDelegatorsData" :key="delegation">
      <div>
        <BaseUser
          class=""
          :address="delegation"
          :profile="profiles[delegation]"
        />
      </div>
    </div>
  </div>
  <div v-if="myDelegatorsData.length === 0 && myDelegationsData.length === 0">
    <div
      class="mt-2 mb-3 border-y border-skin-border bg-skin-block-bg p-4 text-base md:rounded-xl md:border"
    >
      You are not currently delegating to anyone.
    </div>
  </div>
</template>
