<script setup lang="ts">
import { isAddress } from '@ethersproject/address';
import capitalize from 'lodash/capitalize';
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: 'setup' | 'settings';
  space?: ExtendedSpace;
  isSpaceController?: boolean;
}>();

const { form, validationErrors } = useFormSpaceSettings(props.context);
const { notify } = useFlashNotification();
const { web3Account } = useWeb3();
const { t } = useI18n();

const inputAddMembers = ref('');
const inputAddRole = ref('author');

type Member = {
  address: string;
  role: string;
};

const members = computed(() => {
  const members: Member[] = [];
  form.value.admins.forEach((admin: string) => {
    members.push({
      address: admin,
      role: 'admin'
    });
  });

  form.value.moderators.forEach((member: string) => {
    if (form.value.admins?.includes(member)) {
      form.value.moderators = form.value.moderators?.filter(m => m !== member);
      return;
    }
    members.push({
      address: member,
      role: 'moderator'
    });
  });

  form.value.members.forEach((member: string) => {
    if (
      form.value.admins?.includes(member) ||
      form.value.moderators?.includes(member)
    ) {
      form.value.members = form.value.members?.filter(m => m !== member);
      return;
    }
    members.push({
      address: member,
      role: 'author'
    });
  });

  return members;
});

const isAbleToChangeMembers = computed(() => {
  if (props.context === 'setup') return true;
  if (props.context === 'settings') {
    if (props.isSpaceController) return true;
    if (props.space?.admins?.includes(web3Account.value.toLowerCase()))
      return true;
  }
  return false;
});

const isAbleToChangeAdmins = computed(() => {
  if (props.context === 'setup') return true;
  if (props.context === 'settings') {
    if (props.isSpaceController) return true;
  }
  return false;
});

function changeMemberRole(address: string, role: string, close: () => void) {
  if (!isAbleToChangeMembers.value) return;
  if (role === 'admin' && !isAbleToChangeAdmins.value) return;
  if (props.space?.admins?.includes(address) && !isAbleToChangeAdmins.value)
    return;

  if (role === 'admin' && !form.value.admins?.includes(address)) {
    form.value.admins = [...form.value.admins, address];
    form.value.moderators = form.value.moderators?.filter(
      member => member !== address
    );
    form.value.members = form.value.members?.filter(
      member => member !== address
    );
  } else if (
    role === 'moderator' &&
    !form.value.moderators?.includes(address)
  ) {
    form.value.moderators = [...form.value.moderators, address];
    form.value.admins = form.value.admins?.filter(member => member !== address);
    form.value.members = form.value.members?.filter(
      member => member !== address
    );
  } else if (role === 'author' && !form.value.members?.includes(address)) {
    form.value.members = [...form.value.members, address];
    form.value.admins = form.value.admins?.filter(member => member !== address);
    form.value.moderators = form.value.moderators?.filter(
      member => member !== address
    );
  }
  close();
}

function deleteMember(member: Member) {
  if (!isAbleToChangeMembers.value) return;
  if (
    props.space?.admins?.includes(member.address) &&
    !isAbleToChangeAdmins.value
  )
    return;

  if (member.role === 'admin') {
    form.value.admins = form.value.admins?.filter(m => m !== member.address);
  } else if (member.role === 'moderator') {
    form.value.moderators = form.value.moderators?.filter(
      m => m !== member.address
    );
  } else if (member.role === 'author') {
    form.value.members = form.value.members?.filter(m => m !== member.address);
  }
}

function addMembers(addresses: string) {
  inputAddMembers.value = addresses;

  const addressesArray = addresses
    .split(',')
    .map(address => address.trim().toLowerCase())
    .filter(address => isAddress(address))
    .filter(address => {
      const isNotMember =
        !form.value.admins?.includes(address) &&
        !form.value.moderators?.includes(address) &&
        !form.value.members?.includes(address);
      return isNotMember;
    });

  if (addressesArray.length === 0) return;

  addressesArray.forEach(address => {
    if (inputAddRole.value === 'admin') {
      form.value.admins = [...form.value.admins, address];
    }
    if (inputAddRole.value === 'moderator') {
      form.value.moderators = [...form.value.moderators, address];
    }
    if (inputAddRole.value === 'author') {
      form.value.members = [...form.value.members, address];
    }
  });

  nextTick(() => {
    inputAddMembers.value = '';
  });
  notify(['green', t('settings.members.membersAdded')]);
}

const errorMessage = computed(() => {
  if (inputAddMembers.value === '') return '';

  const membersArray = inputAddMembers.value
    .split(',')
    .map(address => address.trim().toLowerCase());

  let message = '';

  membersArray.forEach(address => {
    if (!isAddress(address)) {
      message = t('settings.members.invalidAddress');
      return;
    }
    const isMember =
      form.value.admins?.includes(address) ||
      form.value.moderators?.includes(address) ||
      form.value.members?.includes(address);
    if (isMember) {
      message = t('settings.members.alreadyExists');
      return;
    }
  });

  return message;
});
</script>

<template>
  <BaseBlock
    :title="$t('settings.members.title')"
    :information="$t('settings.members.information')"
  >
    <div class="space-y-1">
      <div
        v-for="member in members"
        :key="member.address"
        class="flex items-center justify-between"
      >
        <BaseUser :address="member.address" />

        <div class="flex items-center gap-1">
          <BasePopover>
            <template #button>
              <SettingsMembersPopoverButton
                :selected-role="capitalize(member.role)"
                :is-able-to-change-admins="isAbleToChangeAdmins"
                :is-able-to-change-members="isAbleToChangeMembers"
                :is-admin="space?.admins?.includes(member.address)"
              />
            </template>
            <template #content="{ close }">
              <SettingsMembersPopoverContent
                :current-role="member.role"
                :is-able-to-change-admins="isAbleToChangeAdmins"
                :is-able-to-change-members="isAbleToChangeMembers"
                @change="changeMemberRole(member.address, $event, close)"
              />
            </template>
          </BasePopover>
          <BaseButtonIcon
            :class="{
              'cursor-not-allowed':
                !isAbleToChangeMembers ||
                (space?.admins?.includes(member.address) &&
                  !isAbleToChangeAdmins)
            }"
            @click="deleteMember(member)"
          >
            <i-ho-x class="text-base" />
          </BaseButtonIcon>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <div class="flex gap-1">
        <TuneInput
          :model-value="inputAddMembers"
          :error="errorMessage"
          :disabled="!isAbleToChangeMembers"
          :label="$t('settings.members.addMembers')"
          :hint="$t('settings.members.addMembersInformation')"
          placeholder="0x3901D0fDe202aF1427216b79f5243f8A022d68cf, 0x3901D0fDe202aF1427216b79f5243f8A022d68cf"
          class="w-full"
          @update:model-value="addMembers"
        />

        <BasePopover>
          <template #button>
            <SettingsMembersPopoverButton
              class="mt-[12px]"
              :selected-role="capitalize(inputAddRole)"
              :is-able-to-change-admins="isAbleToChangeAdmins"
              :is-able-to-change-members="isAbleToChangeMembers"
            />
          </template>
          <template #content="{ close }">
            <SettingsMembersPopoverContent
              :current-role="inputAddRole"
              :is-able-to-change-admins="isAbleToChangeAdmins"
              :is-able-to-change-members="isAbleToChangeMembers"
              @change="
                inputAddRole = $event;
                close();
              "
            />
          </template>
        </BasePopover>
      </div>
      <BaseBlock
        v-if="
          validationErrors?.admins ||
          validationErrors?.moderators ||
          validationErrors?.members
        "
        class="mt-2 !border-red"
      >
        <BaseIcon name="warning" class="mr-2 !text-red" />
        <span class="!text-red">
          {{
            validationErrors?.admins ||
            validationErrors?.moderators ||
            validationErrors?.members
          }}
        </span>
      </BaseBlock>
    </div>
  </BaseBlock>
</template>
