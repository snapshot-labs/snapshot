<template>
  <div>
    <Container :slim="true">
      <router-link
        v-for="namespace in namespaces"
        :key="namespace.address"
        :to="{ name: 'proposals', params: { key: namespace.key } }"
      >
        <Block class="text-center">
          <Token :namespace="namespace.key" size="88" class="mb-3" />
          <div>
            <h2>
              {{ namespace.name }}
              <span class="text-gray">{{ namespace.symbol }}</span>
            </h2>
          </div>
        </Block>
      </router-link>
      <a href="https://discord.snapshot.page" target="_blank">
        <Block class="text-center">
          <div
            v-text="'+'"
            style="width: 88px; height: 88px; color: white; font-size: 76px; padding-top: 6px;"
            class="bg-gray-3 circle mx-auto mb-3"
          />
          <h2 v-text="'Create space'" />
        </Block>
      </a>
    </Container>
  </div>
</template>

<script>
import namespaces from '@/namespaces.json';
import domains from '@/domains.json';

export default {
  data() {
    return {
      namespaces: Object.fromEntries(
        Object.entries(namespaces).filter(namespace => namespace[1].visible)
      )
    };
  },
  created() {
    const domainName = window.location.hostname;
    if (domains[domainName])
      this.$router.push({
        name: 'proposals',
        params: {
          key: domains[domainName]
        }
      });
  }
};
</script>
