<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  isAdmin: boolean;
  isModerator: boolean;
}>();

const router = useRouter();

const { t } = useI18n();
const { send, isSending } = useClient();
const { removeSpaceProposal } = useProposals();
const { notify } = useFlashNotification();
const { web3Account } = useWeb3();

const isCreator = computed(() => props.proposal?.author === web3Account.value);

const threeDotItems = computed(() => {
  const items: { text: string; action: string }[] = [];
  if (isCreator.value && props.proposal.state === 'pending')
    items.push({ text: t('edit'), action: 'edit' });
  items.push({ text: t('duplicate'), action: 'duplicate' });

  if ((props.isAdmin || props.isModerator) && !props.proposal.flagged) {
    items.push({ text: t('flag'), action: 'flag' });
  } else {
    items.push({ text: t('report'), action: 'report' });
  }
  if (props.isAdmin || props.isModerator || isCreator.value)
    items.push({ text: t('delete'), action: 'delete' });
  return items;
});

async function deleteProposal() {
  const result = await send(props.space, 'delete-proposal', {
    proposal: props.proposal
  });
  console.log('Result', result);
  if (result.id) {
    removeSpaceProposal(props.proposal.id);
    notify(['green', t('notify.proposalDeleted')]);
    router.push({ name: 'spaceProposals' });
  }
}

const {
  shareProposalX,
  shareProposalHey,
  shareToClipboard,
  shareProposal,
  sharingIsSupported,
  sharingItems
} = useSharing();

const { resetForm } = useFormSpaceProposal();

async function handleSelect(e) {
  if (!props.proposal) return;
  if (e === 'delete') deleteProposal();
  if (e === 'report') window.open('https://tally.so/r/mDBEGb', '_blank');
  if (e === 'flag') {
    await send(props.space, 'flag-proposal', {
      proposal: props.proposal
    });
  }
  if (e === 'duplicate' || e === 'edit') {
    resetForm();
    router.push({
      name: 'spaceCreate',
      params: {
        key: props.proposal.space.id,
        sourceProposal: props.proposal.id
      },
      query: { editing: e === 'edit' ? 'true' : undefined }
    });
  }
}

function handleSelectShare(e: string) {
  if (e === 'shareProposalHey')
    return shareProposalHey(props.space, props.proposal);

  if (sharingIsSupported.value)
    return shareProposal(props.space, props.proposal);

  if (e === 'shareProposalX')
    return shareProposalX(props.space, props.proposal);

  if (e === 'shareToClipboard')
    return shareToClipboard(props.space, props.proposal);
}

const { profiles, loadProfiles } = useProfiles();

watch(
  () => props.proposal,
  () => {
    if (!props.proposal) return;
    loadProfiles([props.proposal.author]);
  }
);
</script>

<template>
  <h1
    class="break-words text-xl leading-8 sm:leading-[44px] sm:text-2xl"
    data-testid="proposal-page-title"
    v-text="proposal.title"
  />

  <div class="mb-4 flex">
    <div class="flex items-center space-x-1">
      <LinkSpace :space-id="space.id" class="group text-skin-text">
        <div class="flex items-center">
          <AvatarSpace :space="space" size="20" />
          <span class="ml-1 group-hover:text-skin-link" v-text="space.name" />
        </div>
      </LinkSpace>
      <span v-text="$t('proposalBy')" />
      <BaseUser
        :address="proposal.author"
        :profile="profiles[proposal.author]"
        :space="space"
        :proposal="proposal"
        hide-avatar
      />
    </div>
    <div class="flex grow items-center space-x-3">
      <BaseMenu
        class="!ml-auto pl-3"
        :items="sharingItems"
        @select="handleSelectShare"
      >
        <template #button>
          <ButtonShare />
        </template>
        <template #item="{ item }">
          <div class="flex items-center gap-2">
            <i-s-x v-if="item.extras.icon === 'x'" />
            <i-s-hey v-if="item.extras.icon === 'hey'" class="mr-1 text-sm" />
            <i-ho-link v-if="item.extras.icon === 'link'" />
            {{ item.text }}
          </div>
        </template>
      </BaseMenu>
      <BaseMenu :items="threeDotItems" @select="handleSelect">
        <template #button>
          <div>
            <BaseButtonIcon :loading="isSending" class="!p-0">
              <i-ho-dots-horizontal />
            </BaseButtonIcon>
          </div>
        </template>
        <template #item="{ item }">
          <div class="flex items-center gap-2">
            <i-ho-pencil v-if="item.action === 'edit'" />
            <i-ho-document-duplicate v-if="item.action === 'duplicate'" />
            <i-ho-flag
              v-if="item.action === 'report' || item.action === 'flag'"
            />
            <i-ho-trash v-if="item.action === 'delete'" />
            {{ item.text }}
          </div>
        </template>
      </BaseMenu>
    </div>
  </div>
</template>
