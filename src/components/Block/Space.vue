<template>
  <Block :slim="true" class="overflow-hidden">
    <div class="text-center border-bottom header-bg pb-2">
      <Token :space="space" symbolIndex="space" size="80" class="mt-3 mb-2" />
      <div class="d-inline-block d-lg-block v-align-middle mt-3 mt-lg-0">
        <h3 class="px-4">{{ space.name }}</h3>
        <div class="mb-1" v-if="space.github || space.twitter">
          <a
            v-if="space.twitter"
            :href="`https://twitter.com/${space.twitter}`"
            target="_blank"
          >
            <Icon size="20" name="twitter" class="mx-2" />
          </a>
          <a
            v-if="space.github"
            :href="`https://github.com/${space.github}`"
            target="_blank"
          >
            <Icon size="20" name="github" class="mx-2" />
          </a>
        </div>
      </div>
    </div>
    <div class="overflow-auto menu-tabs text-center text-lg-left">
      <div class="responsivenav pt-2 py-lg-3 px-2 px-lg-0">
        <router-link
          :to="{
            name: domain ? 'home' : 'space-proposals',
            params: { key: space.key }
          }"
          :class="
            $route.name === 'space-proposals' && 'router-link-exact-active'
          "
          v-text="$t('Proposals')"
          class="d-lg-block d-inline-block px-4 py-2 responsivenav-item"
        />
        <router-link
          :to="{ name: 'create', params: { key: space.key } }"
          v-text="$t('proposals.new')"
          class="d-lg-block d-inline-block px-4 py-2 responsivenav-item"
        />
        <router-link
          v-if="
            space.strategies.find(strategy => strategy.name === 'delegation')
          "
          :to="{ name: 'delegate', params: { key: space.key } }"
          v-text="$t('delegate.header')"
          class="d-lg-block d-inline-block px-4 py-2 responsivenav-item"
        />
        <router-link
          :to="{ name: 'space-about', params: { key: space.key } }"
          v-text="$t('about')"
          class="d-lg-block d-inline-block px-4 py-2 responsivenav-item"
        />
        <router-link
          v-if="isAdmin"
          :to="{ name: 'settings' }"
          v-text="$t('settings.header')"
          class="d-lg-block d-inline-block px-4 py-2 responsivenav-item"
        />
      </div>
    </div>
  </Block>
</template>

<script>
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { computed } from 'vue';

export default {
  props: ['space'],
  setup(props) {
    const store = useStore();
    const auth = getInstance();

    const web3Account = computed(() => store.state.web3.account);

    return {
      isAdmin: computed(() => {
        const admins = props.space.admins.map(address => address.toLowerCase());
        return (
          auth.isAuthenticated.value &&
          web3Account.value &&
          admins.includes(web3Account.value.toLowerCase())
        );
      })
    };
  }
};
</script>
