<script setup>
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loaded = ref(false);
const specifySpaceChecked = ref(false);
const { modalAccountOpen } = useModal();
const { web3Account } = useWeb3();

const form = ref({
  address: route.params.to || '',
  id: route.params.key || ''
});

onMounted(async () => {
  console.log(route.params.key);
  if (route.params.key) specifySpaceChecked.value = true;
  // TODO: Check if space exist

  // setPageTitle('page.title.lobot');

  loaded.value = true;
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div class="mb-3 px-4 md:px-0">
        <ButtonBack @click="$router.go(-1)" />
        <h1>Lobot - Voting automation</h1>
        <div v-if="!web3Account" class="my-4">
          <div>Connect wallet to continue</div>
        </div>
        <div v-else-if="!specifySpaceChecked" class="my-4">
          <div>Select space to continue</div>
        </div>
        <div v-else-if="loaded" class="my-4">
          <h3 class="my-2 mb-3 break-words leading-7">Preferences</h3>
          <BaseBlock
            class="my-4"
            title="Top votes"
            information="Lobot will vote based on top votes in proposal"
          >
            Weight
            <UiInput
              v-model.trim="form.address"
              class="my-2"
              placeholder="100"
              :error="validateToInput"
            >
            </UiInput>
          </BaseBlock>

          <BaseBlock
            title="Followers"
            information="Lobot will vote based on your followers"
          >
            Weight
            <UiInput
              v-model.trim="form.address"
              class="my-2"
              placeholder="100"
              :error="validateToInput"
            >
            </UiInput>
            Followers:
            <TextareaArray
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="input w-full text-left"
              style="font-size: 18px"
            />
          </BaseBlock>
          <BaseBlock
            class="my-4"
            title="Previous votes and other preferences"
            information="Lobot will vote based on your previous votes"
          >
            Coming soon
          </BaseBlock>
        </div>
      </div>
      <LoadingPage v-if="!loaded" />
    </template>
    <template v-if="web3Account && specifySpaceChecked" #sidebar-right>
      <BaseBlock>
        <BaseButton
          :disabled="!isValidForm && !!web3Account"
          :loading="delegationLoading || spaceLoading"
          class="block w-full"
          primary
          @click="web3Account ? handleSubmit() : (modalAccountOpen = true)"
        >
          {{ $t('confirm') }}
        </BaseButton>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
