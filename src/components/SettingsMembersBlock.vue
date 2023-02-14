<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { isAddress } from '@ethersproject/address';
import capitalize from 'lodash/capitalize';
import { ExtendedSpace } from '@/helpers/interfaces';

import { useSpaceForm, useFlashNotification, useWeb3 } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
  space?: ExtendedSpace;
  ensOwner?: boolean;
}>();

const { form } = useSpaceForm(props.context);
const { notify } = useFlashNotification();
const { web3Account } = useWeb3();
form.value.moderators = [];

const inputAddMembers = ref('');

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
    if (props.ensOwner) return true;
    if (props.space?.admins?.includes(web3Account.value)) return true;
  }
  return false;
});

const isAbleToChangeAdmins = computed(() => {
  if (props.context === 'setup') return true;
  if (props.context === 'settings') {
    if (props.ensOwner) return true;
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

function deleteMember(member) {
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
    .map(address => address.trim())
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
    form.value.members = [...form.value.members, address];
  });

  nextTick(() => {
    inputAddMembers.value = '';
  });
  notify(['green', 'Members added']);
}

const errorMessage = computed(() => {
  if (inputAddMembers.value === '') return { message: '' };

  const membersArray = inputAddMembers.value
    .split(',')
    .map(address => address.trim());

  let message = '';

  membersArray.forEach(address => {
    if (!isAddress(address)) return (message = 'Invalid address');
    const isMember =
      form.value.admins?.includes(address) ||
      form.value.moderators?.includes(address) ||
      form.value.members?.includes(address);
    if (isMember) return (message = 'Member already exists');
  });

  return { message, push: true };
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
              <InputSelect
                v-if="
                  props.space?.admins?.includes(member.address) &&
                  !isAbleToChangeAdmins
                "
                title=""
                :model-value="capitalize(member.role)"
                class="cursor-not-allowed"
                @click.stop
              />
              <InputSelect
                v-else
                title=""
                :model-value="capitalize(member.role)"
              />
            </template>
            <template #content="{ close }">
              <div class="my-2">
                <div
                  v-for="role in ['admin', 'moderator', 'author']"
                  :key="role"
                >
                  <div
                    class="flex items-center px-3 py-2"
                    :class="[
                      (isAbleToChangeMembers &&
                        (role === 'author' || role === 'moderator')) ||
                      (isAbleToChangeAdmins && role === 'admin')
                        ? 'cursor-pointer hover:bg-skin-border'
                        : 'hover:bg-skin-background cursor-not-allowed'
                    ]"
                    @click="changeMemberRole(member.address, role, close)"
                  >
                    <div class="">
                      <div class="font-semibold text-skin-heading">
                        {{ capitalize(role) }}
                      </div>
                      <span class="opacity-80">
                        {{ $t(`settings.members.${role}.description`) }}
                      </span>
                    </div>
                    <div class="px-3">
                      <i-ho-check v-if="member.role === role" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BasePopover>
          <BaseButtonIcon @click="deleteMember(member)">
            <i-ho-x class="text-base" />
          </BaseButtonIcon>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <BaseInput
        :model-value="inputAddMembers"
        :error="errorMessage"
        :title="$t('settings.members.addMembers')"
        :information="$t('settings.members.addMembersInformation')"
        placeholder="0x3901D0fDe202aF1427216b79f5243f8A022d68cf, 0x3901D0fDe202aF1427216b79f5243f8A022d68cf"
        class="w-full"
        @update:model-value="addMembers"
      />
    </div>
  </BaseBlock>
</template>
