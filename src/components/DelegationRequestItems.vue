<script setup lang="ts">
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useClient } from '@/composables/useClient';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useProfiles } from '@/composables/useProfiles';
import { SPACE_DELEGATIONS_REQUEST } from '@/helpers/queries';
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

const delegateRequests: any = ref([]);
const delegatorRequests: any = ref([]);

onMounted(async () => {
  const delegationRequests: any = await apolloQuery(
    {
      query: SPACE_DELEGATIONS_REQUEST,
      variables: {
        first: 1000,
        skip: 0,
        space: props.space
      }
    },
    'delegationRequests'
  );
  console.log(delegationRequests);
  delegateRequests.value = delegationRequests.filter(a => a.iam === 'delegate');
  delegatorRequests.value = delegationRequests.filter(
    a => a.iam === 'delegator'
  );
  console.log(delegateRequests.value);
  console.log(delegatorRequests.value);
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
  <h2 class="my-2 mt-4 mb-4 break-words leading-7">Requests from delegates:</h2>
  <div v-if="delegateRequests.length > 0" class="grid grid-cols-3 gap-4">
    <div
      v-for="delegateRequest in delegateRequests"
      :key="delegateRequest.user"
    >
      <BaseBlock slim class="transition-colors md:hover:border-skin-text">
        <div>
          <div class="grid p-3">
            <div>
              <h4>{{ delegateRequest.title }}</h4>
              {{ delegateRequest.description }}
            </div>
            <div>
              By:
              <BaseUser
                class=""
                :address="delegateRequest.user"
                :profile="profiles[delegateRequest.user]"
              />
            </div>
            <BaseButton
              type="submit"
              class="m-1"
              primary
              :disabled="props.currentAccount === delegateRequest.user"
              @click="delegateTo(delegateRequest.user, delegateRequest.id)"
            >
              Delegate
            </BaseButton>
          </div>
          <!-- <h3 class="my-1 break-words leading-7" v-text="proposal.title" />
      <p class="mb-2 break-words sm:text-md" v-text="shorten(body, 140)" /> -->
        </div>
      </BaseBlock>
    </div>
  </div>
  <div
    v-else
    class="mt-2 mb-3 border-y border-skin-border bg-skin-block-bg p-4 text-base md:rounded-xl md:border"
  >
    No requests in this space
  </div>
  <h2 class="my-2 mt-4 mb-4 break-words leading-7">
    Requests from delegators:
  </h2>
  <div v-if="delegatorRequests.length > 0" class="grid grid-cols-3 gap-4">
    <div
      v-for="delegateRequest in delegatorRequests"
      :key="delegateRequest.user"
    >
      <BaseBlock slim class="transition-colors md:hover:border-skin-text">
        <div>
          <div class="grid grid-flow-col grid-rows-3 gap-2 p-3">
            <div>
              <h4>{{ delegateRequest.title }}</h4>
              {{ delegateRequest.description }}
            </div>
            <div>
              By:
              <BaseUser
                :address="delegateRequest.user"
                :profile="profiles[delegateRequest.user]"
              />
            </div>
            <BaseButton
              type="submit"
              class="m-1"
              primary
              :disabled="props.currentAccount === delegateRequest.user"
            >
              Request for Delegation
            </BaseButton>
          </div>
          <!-- <h3 class="my-1 break-words leading-7" v-text="proposal.title" />
         <p class="mb-2 break-words sm:text-md" v-text="shorten(body, 140)" /> -->
        </div>
      </BaseBlock>
    </div>
  </div>
  <div
    v-else
    class="mt-2 mb-3 border-y border-skin-border bg-skin-block-bg p-4 text-base md:rounded-xl md:border"
  >
    No requests in this space
  </div>
</template>
