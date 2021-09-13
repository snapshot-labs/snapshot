<template>
  <Block title="Subscribe">
    <UiInput :required="false" placeholder="Enter Your Email" v-model="email">
    </UiInput>
    <UiButton
      :loading="loading"
      :disabled="email === ''"
      class="width-full mb-2 button--submit"
      @click="action"
    >
      {{ $t('subscribe.action') }}
    </UiButton>
  </Block>
</template>
<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/subscribe';

export default {
  props: ['proposalId'],
  inject: ['notify'],
  data() {
    return {
      loading: false,
      email: '',
      plugin: new Plugin()
    };
  },
  methods: {
    async action() {
      const regEmail = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (regEmail.test(this.email)) {
        this.loading = true;
        const res = await this.plugin
          .subscribe(this.proposalId, this.email)
          .catch(() => {
            this.notify(['red', this.$t('subscribe.network_error')]);
          });
        this.loading = false;
        if (!res) {
          return;
        }
        if (res.status === 200){
          this.notify(['green', this.$t('subscribe.subscribe_success')]);
        } else {
          this.notify([
            'red',
            this.$t('subscribe.subscribe_fail', [res.message])
          ]);
        }
      } else {
        this.notify(['red', this.$t('subscribe.email_format_error')]);
      }
    }
  }
};
</script>
