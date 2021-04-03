<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link
          :to="{ name: domain ? 'home' : 'proposals' }"
          class="text-gray"
        >
          <Icon name="back" size="22" class="v-align-middle" />
          {{ space.name }}
        </router-link>
      </div>
      <div class="px-4 px-md-0">
        <div class="d-flex flex-column mb-6">
          <Block v-if="space.filters?.onlyMembers && !isMember">
            <Icon name="warning" class="mr-1"/>
            {{ $t('create.onlyMembersWarning') }}
          </Block>
          <input
            v-model="form.name"
            maxlength="128"
            class="h1 mb-2 input"
            :placeholder="$t('create.question')"
            ref="nameForm"
          />
          <TextareaAutosize
            v-model="form.body"
            class="input pt-1"
            :placeholder="$t('create.content')"
          />
          <div class="mb-6">
            <p v-if="form.body.length > bodyLimit" class="text-red mt-4">
              -{{ _n(-(bodyLimit - form.body.length)) }}
            </p>
          </div>
          <div v-if="form.body">
            <h4 class="mb-4">{{ $t('create.preview') }}</h4>
            <UiMarkdown :body="form.body" />
          </div>
        </div>
      </div>
      <Block :title="$t('create.choices')">
        <div v-if="choices.length > 0" class="overflow-hidden mb-2">
          <draggable
            v-model="choices"
            tag="transition-group"
            :component-data="{ name: 'list' }"
            item-key="id"
          >
            <template #item="{ element, index }">
              <div class="d-flex mb-2">
                <UiButton class="d-flex width-full">
                  <span class="mr-4">{{ index + 1 }}</span>
                  <input
                    v-model="element.text"
                    class="input height-full flex-auto text-center"
                    maxlength="32"
                  />
                  <span @click="removeChoice(index)" class="ml-4">
                    <Icon name="close" size="12" />
                  </span>
                </UiButton>
              </div>
            </template>
          </draggable>
        </div>
        <UiButton @click="addChoice(1)" class="d-block width-full">
          {{ $t('create.addChoice') }}
        </UiButton>
      </Block>
    </template>
    <template #sidebar-right>
      <Block
        :title="$t('actions')"
        :icon="
          space.plugins && Object.keys(space.plugins).length > 0
            ? 'stars'
            : undefined
        "
        @submit="modalProposalPluginsOpen = true"
      >
        <div class="mb-2">
          <UiButton
            @click="[(modalOpen = true), (selectedDate = 'start')]"
            class="width-full mb-2"
          >
            <span v-if="!form.start">{{ $t('create.startDate') }}</span>
            <span v-else v-text="$d(form.start * 1e3, 'short', 'en-US')" />
          </UiButton>
          <UiButton
            @click="[(modalOpen = true), (selectedDate = 'end')]"
            class="width-full mb-2"
          >
            <span v-if="!form.end">{{ $t('create.endDate') }}</span>
            <span v-else v-text="$d(form.end * 1e3, 'short', 'en-US')" />
          </UiButton>
          <UiButton class="width-full mb-2">
            <input
              v-model="form.snapshot"
              type="number"
              class="input width-full text-center"
              :placeholder="$t('create.snapshotBlock')"
            />
          </UiButton>
        </div>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          :loading="loading"
          class="d-block width-full button--submit"
        >
          {{ $t('create.publish') }}
        </UiButton>
      </Block>
      <PluginDaoModuleCustomBlock
        v-if="form.metadata.plugins?.daoModule?.txs"
        :proposalConfig="form.metadata.plugins.daoModule"
      />
    </template>
  </Layout>
  <teleport to="#modal">
    <ModalSelectDate
      :value="form[selectedDate]"
      :selectedDate="selectedDate"
      :open="modalOpen"
      @close="modalOpen = false"
      @input="setDate"
    />
    <ModalProposalPlugins
      :space="space"
      :proposal="{ ...form, choices }"
      v-model="form.metadata.plugins"
      :open="modalProposalPluginsOpen"
      @close="modalProposalPluginsOpen = false"
    />
  </teleport>
</template>

<script>
import { mapActions } from 'vuex';
import draggable from 'vuedraggable';
import { ipfsGet } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';

const gateway = process.env.VUE_APP_IPFS_GATEWAY || gateways[0];

export default {
  components: {
    draggable
  },
  data() {
    return {
      key: this.$route.params.key,
      from: this.$route.params.from,
      loading: false,
      choices: [],
      blockNumber: -1,
      bodyLimit: 1e4,
      form: {
        name: '',
        body: '',
        choices: [],
        start: '',
        end: '',
        snapshot: '',
        metadata: {}
      },
      modalOpen: false,
      modalProposalPluginsOpen: false,
      selectedDate: '',
      counter: 0
    };
  },
  computed: {
    space() {
      return this.app.spaces[this.key];
    },
    isMember() {
      const members = this.space.members.map(address => address.toLowerCase());
      return (
        this.$auth.isAuthenticated.value &&
        this.web3.account &&
        members.includes(this.web3.account.toLowerCase())
      );
    },
    isValid() {
      // const ts = (Date.now() / 1e3).toFixed();
      return (
        !this.loading &&
        this.web3.account &&
        this.form.name &&
        this.form.body &&
        this.form.body.length <= this.bodyLimit &&
        this.form.start &&
        // this.form.start >= ts &&
        this.form.end &&
        this.form.end > this.form.start &&
        this.form.snapshot &&
        this.form.snapshot > this.blockNumber / 2 &&
        this.choices.length >= 2 &&
        !this.choices.some(a => a.text === '') &&
        (!this.space.filters?.onlyMembers ||
          (this.space.filters?.onlyMembers && this.isMember))
      );
    }
  },
  async mounted() {
    this.$refs.nameForm.focus();
    this.addChoice(2);
    this.blockNumber = await getBlockNumber(getProvider(this.space.network));
    this.form.snapshot = this.blockNumber;
    if (this.from) {
      try {
        const proposal = await ipfsGet(gateway, this.from);
        const msg = JSON.parse(proposal.msg);
        this.form = msg.payload;
        this.choices = msg.payload.choices.map((text, key) => ({ key, text }));
      } catch (e) {
        console.log(e);
      }
    }
  },
  methods: {
    ...mapActions(['send']),
    addChoice(num) {
      for (let i = 1; i <= num; i++) {
        this.counter++;
        this.choices.push({ key: this.counter, text: '' });
      }
    },
    removeChoice(i) {
      this.choices.splice(i, 1);
    },
    setDate(ts) {
      if (this.selectedDate) {
        this.form[this.selectedDate] = ts;
      }
    },
    async handleSubmit() {
      this.loading = true;
      this.form.choices = this.choices.map(choice => choice.text);
      this.form.metadata.strategies = this.space.strategies;
      try {
        const { ipfsHash } = await this.send({
          space: this.space.key,
          type: 'proposal',
          payload: this.form
        });
        this.$router.push({
          name: 'proposal',
          params: {
            key: this.key,
            id: ipfsHash
          }
        });
      } catch (e) {
        console.error(e);
        this.loading = false;
      }
    }
  }
};
</script>

<style>
.list-leave-active,
.list-enter-active {
  transition: all 0.3s;
}
.list-move {
  transition: transform 0.3s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
}
</style>
