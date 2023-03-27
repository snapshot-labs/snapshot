<script setup>
import Plugin from '../index';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';

const { notify } = useFlashNotification();
const { web3Account } = useWeb3();
const { t } = useI18n();

const props = defineProps([
  'space',
  'proposal',
  'results',
  'loaded',
  'strategies'
]);
let loading = false;
let addIsLoading = ref(false);
let deleteIsLoading = ref(false);
let completeIsLoading = ref(false);
let editMode = ref(false);
let newStepDescription = ref('');
let steps = ref([]);
let closeModal = ref(false);
let stepToDelete = ref({});
let currentlyLoadingStepId = ref(null);

function isOwner() {
  return web3Account.value === props.proposal.author;
}
function isComplete() {
  return props.proposal?.state !== 'active';
}
function completedDate() {
  return formatDate(new Date(props.proposal?.end * 1000));
}
function firstIncompleteStepId() {
  return steps.value.find(step => step.stepStatus === 'active').id;
}
async function requireSignature() {
  const storedAuth = localStorage.getItem('snap-progress');
  if (storedAuth) {
    return storedAuth;
  }

  const auth = getInstance();
  let signature = await signMessage(
    auth.web3,
    t('progress.confirmSignature'),
    web3Account.value
  );

  const authHeader = `${props.proposal.id}-${signature}`;
  localStorage.setItem('snap-progress', authHeader);

  return authHeader;
}
async function getActiveSteps() {
  if (isComplete) {
    const apiUrl = `https://jissr670k3.execute-api.us-east-1.amazonaws.com/dev/proposal/${props.proposal.id}`;
    try {
      fetch(apiUrl).then(response =>
        response
          .json()
          .then(
            data =>
              (steps.value = data.Items.sort((a, b) =>
                a.index > b.index ? 1 : -1
              ))
          )
      );
    } catch (e) {
      notify(['red', t('progress.wentWrong')]);
    }
  }
}
async function createNewStep() {
  if (newStepDescription.value !== '') {
    try {
      const sig = await requireSignature();
      addIsLoading.value = true;
      const apiUrl = `https://jci7szds71.execute-api.us-east-1.amazonaws.com/dev/proposal/${props.proposal.id}`;
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: sig
        },
        body: JSON.stringify({
          description: newStepDescription.value
        })
      };
      fetch(apiUrl, requestOptions).then(response =>
        response.json().then(() => {
          getActiveSteps();
          addIsLoading.value = false;
          newStepDescription.value = '';
        })
      );
    } catch (e) {
      addIsLoading.value = false;
      notify(['red', t('progress.wentWrong')]);
    }
  }
}
async function setStepComplete(step) {
  try {
    const sig = await requireSignature();

    currentlyLoadingStepId.value = step.id;
    completeIsLoading.value = true;
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', authorization: sig },
      body: JSON.stringify({ proposalId: step.proposalId })
    };
    fetch(
      `https://jci7szds71.execute-api.us-east-1.amazonaws.com/dev/proposal/${step.id}`,
      requestOptions
    ).then(() => {
      getActiveSteps();
      completeIsLoading.value = false;
      currentlyLoadingStepId.value = null;
    });
  } catch (error) {
    completeIsLoading.value = false;
    currentlyLoadingStepId.value = null;
    notify(['red', t('progress.wentWrong')]);
  }
}
function closeEvent() {
  closeModal.value = false;
}
function showDeleteModal(step) {
  stepToDelete.value = step;
  closeModal.value = true;
}
async function deleteStep() {
  const step = stepToDelete.value;
  try {
    const sig = await requireSignature();
    deleteIsLoading.value = true;
    const apiUrl = `https://jci7szds71.execute-api.us-east-1.amazonaws.com/dev/proposal/${step.id}?proposalId=${props.proposal.id}`;
    const requestOptions = {
      method: 'DELETE',
      headers: {
        authorization: sig
      }
    };
    fetch(apiUrl, requestOptions).then(() => {
      closeEvent();
      getActiveSteps();
      deleteIsLoading.value = false;
    });
  } catch (error) {
    deleteIsLoading.value = false;
    notify(['red', t('progress.wentWrong')]);
  }
}
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en', options);
}
function toggleEditMode() {
  editMode.value = !editMode.value;
}
function thisStepUpdating(step) {
  if (step.id === currentlyLoadingStepId.value) {
    return true;
  }
  return false;
}
onMounted(async () => {
  getActiveSteps();
});
</script>

<template>
  <BaseBlock title="Progress" :loading="!loaded">
    <div v-if="!isComplete()">{{ $t('progress.comeBack') }}</div>
    <div v-if="isComplete()" class="flex h-0 flex-row-reverse">
      <i
        v-if="isOwner() && isComplete()"
        class="edit-icon iconfont icongear relative cursor-pointer hover:text-skin-link"
        style="font-size: 25px; line-height: 25px"
        @click="toggleEditMode()"
      ></i>
    </div>
    <div v-if="isComplete()" class="flex flex-col">
      <div>
        <div
          :class="{
            'border-green': isComplete()
          }"
          class="h-32 mt-2 min-w-[178px] rounded-xl border-2 bg-skin-block-bg p-3 text-base"
        >
          <div class="h-16 flex">
            <div>
              <div class="step-counter">1</div>
            </div>
            <div class="ml-3 w-full">{{ $t('progress.voting') }}</div>
          </div>
          <div class="flex">
            <div class="w-[55%] text-xs">
              <div v-if="isComplete()" class="leading-[.5rem]">
                {{ $t('progress.completed') }}
              </div>
              <div v-if="isComplete()">
                {{ completedDate() }}
              </div>
            </div>
            <div class="ml-auto flex flex-col-reverse">
              <span v-if="isComplete()" class="status mr-2 bg-green text-white">
                {{ $t('progress.completed') }}
              </span>
              <span
                v-if="!isComplete()"
                class="status mr-2 bg-gray-500 text-white"
                >{{ $t('progress.inProgress') }}</span
              >
            </div>
          </div>
        </div>
        <div class="h-[1rem]">
          <div
            v-if="steps.length > 0"
            class="h-full w-[2.3rem] border-r-2 border-green"
          ></div>
        </div>
        <div v-for="(step, index) in steps" :key="step.id">
          <div
            :class="{
              'border-green': step.stepStatus === 'complete'
            }"
            class="h-32 min-w-[178px] rounded-xl border-2 bg-skin-block-bg p-3 text-base"
          >
            <div class="mb-2 flex min-h-[4rem]">
              <div>
                <div class="step-counter">
                  {{ index + 2 }}
                </div>
              </div>
              <div class="ml-3 w-full">
                {{ step.description }}
              </div>
              <div class="pt-12px relative -top-2 text-right">
                <i
                  v-if="step.stepStatus === 'active' && editMode"
                  class="gg-trash cursor-pointer"
                  @click="showDeleteModal(step)"
                ></i>
              </div>
            </div>
            <div class="flex">
              <div class="w-[55%] text-xs">
                <div
                  v-if="step.stepStatus === 'complete'"
                  class="leading-[.5rem]"
                >
                  {{ $t('progress.completed') }}
                </div>
                <div v-if="step.stepStatus === 'complete'">
                  {{ formatDate(step.completedDate) }}
                </div>
              </div>
              <div class="ml-auto flex flex-col-reverse">
                <span
                  v-if="step.stepStatus === 'complete'"
                  class="status mr-2 bg-green text-white"
                  >{{ $t('progress.completed') }}
                </span>
                <span
                  v-if="
                    step.stepStatus !== 'complete' &&
                    !editMode &&
                    firstIncompleteStepId() === step.id
                  "
                  class="status mr-2 bg-gray-500 text-white"
                  >{{ $t('progress.inProgress') }}
                </span>

                <BaseButton
                  v-if="step.stepStatus !== 'complete' && editMode"
                  class="w-[7rem]"
                  :disabled="firstIncompleteStepId() !== step.id"
                  @click="setStepComplete(step)"
                >
                  <span v-if="!thisStepUpdating(step)">{{
                    $t('progress.complete')
                  }}</span>
                  <div
                    v-if="thisStepUpdating(step)"
                    class="spinner relative"
                  ></div>
                </BaseButton>

                <span
                  v-if="
                    step.stepStatus !== 'complete' &&
                    !editMode &&
                    firstIncompleteStepId() !== step.id
                  "
                  class="status mr-2 bg-gray-500 text-white"
                  >{{ $t('progress.soon') }}
                </span>
              </div>
            </div>
          </div>
          <div class="h-[1rem]">
            <div
              :hidden="index === steps.length - 1"
              :class="{
                'border-green': step.stepStatus === 'complete',
                'border-gray': step.stepStatus !== 'complete'
              }"
              class="h-full w-[2.3rem] border-r-2"
            ></div>
          </div>
        </div>
      </div>
      <div class="w-100">
        <div v-if="editMode" class="mt-4">
          <span class="text-xl">{{ $t('progress.newStep') }}</span>
          <textarea
            v-model="newStepDescription"
            :placeholder="[$t('progress.description')]"
            class="input h-full w-full rounded-3xl border border-skin-border py-3 px-4 text-left focus-within:!border-skin-link hover:border-skin-text"
          />
          <BaseButton
            v-if="isAdmin || isOwner"
            class="button button--primary ml-2 mt-2 w-full px-[24px] hover:brightness-95"
            @click="createNewStep()"
          >
            <span v-if="!addIsLoading">{{ $t('progress.add') }}</span>
            <div v-if="addIsLoading" class="spinner relative"></div>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseBlock>
  <BaseModal :open="closeModal" @close="closeEvent">
    <template #header>
      <h3>{{ $t('progress.deleteStep') }}</h3>
    </template>
    <div class="mt-3 text-center">
      <p>{{ $t('progress.deleteConfirm') }}</p>
    </div>
    <div
      class="mb-2 mt-3 flex content-center items-center justify-center text-center"
    >
      <BaseButton
        class="w-[6rem] !bg-primary !text-white"
        :loading="loading"
        @click="deleteStep"
      >
        <span v-if="!deleteIsLoading">{{ $t('progress.delete') }}</span>
        <div v-if="deleteIsLoading" class="spinner relative"></div>
      </BaseButton>
      <BaseButton :disabled="loading" class="ml-2" @click="closeEvent">
        {{ $t('progress.cancel') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
<style>
.status {
  font-size: 16px;
  height: 26px;
  vertical-align: middle;
  padding: 0 12px;
  border-radius: 14px;
}
.h-16 {
  height: 4rem;
}
.pt-12px {
  padding-top: 12px;
}
a {
  text-decoration: none;
}
a.button .iconfont {
  font-size: 24px;
  transition: 0.4s;
}
a.button:hover .label-hidden {
  max-width: 200px;
  margin-left: 8px;
  opacity: 1;
}
a.button .label-hidden {
  max-width: 0;
  opacity: 0;
  white-space: nowrap;
  transition: 0.4s;
}
a.button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding: 8px;
  border-radius: 8px;
  transition: 0.2s;
}
.edit-icon {
  top: -65px;
}
.stepper-wrapper {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.stepper-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 12px;
  }
}

.stepper-item::before {
  position: absolute;
  content: '';
  border-bottom: 2px solid #ccc;
  width: 100%;
  top: 20px;
  left: -50%;
  z-index: 2;
}

.stepper-item::after {
  position: absolute;
  content: '';
  border-bottom: 2px solid #ccc;
  width: 100%;
  top: 20px;
  left: 50%;
  z-index: 2;
}

.step-counter {
  position: relative;
  color: white;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #565656;
  margin-bottom: 6px;
}

.stepper-item.active {
  font-weight: bold;
}

.stepper-item.completed .step-counter {
  background-color: #4bb543;
}

.stepper-item.completed::after {
  position: absolute;
  content: '';
  border-bottom: 2px solid #4bb543;
  width: 100%;
  top: 20px;
  left: 50%;
  z-index: 3;
}

.stepper-item:first-child::before {
  content: none;
}
.stepper-item:last-child::after {
  content: none;
}
.step-name {
  text-align: center;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.spinner:before {
  content: '';
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  margin-left: -10px;
  border-radius: 50%;
  border: 2px solid #f6f;
  border-top-color: #0e0;
  border-right-color: #0dd;
  border-bottom-color: #f90;
  animation: spinner 0.6s linear infinite;
}
.gg-trash {
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(var(--ggs, 1));
  width: 10px;
  height: 12px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 2px, inset -2px 0 0, inset 2px 0 0;
  border-bottom-left-radius: 1px;
  border-bottom-right-radius: 1px;
  margin-top: 4px;
}
.gg-trash::after,
.gg-trash::before {
  content: '';
  display: block;
  box-sizing: border-box;
  position: absolute;
}
.gg-trash::after {
  background: currentColor;
  border-radius: 3px;
  width: 16px;
  height: 2px;
  top: -4px;
  left: -5px;
}
.gg-trash::before {
  width: 10px;
  height: 4px;
  border: 2px solid;
  border-bottom: transparent;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  top: -7px;
  left: -2px;
}
</style>
