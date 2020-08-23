<template>
  <div>
    <Container>
      <h2 class="mb-3">Dashboard</h2>
    </Container>
    <Container :slim="true">
      <router-link
        v-for="namespace in namespaces"
        :key="namespace.token"
        :to="{ name: 'proposals', params: { key: namespace.key } }"
      >
        <Block class="text-center">
          <Token :address="namespace.image" size="128" class="mb-4" />
          <div>
            <h2>
              {{ namespace.name }}
              <span class="text-gray">{{ namespace.symbol }}</span>
            </h2>
          </div>
        </Block>
      </router-link>
    </Container>
  </div>
</template>

<script>
import namespaces from '@/namespaces.json';

export default {
  data() {
    return {
      namespaces
    };
  },
  created() {
    if (Object.keys(this.namespaces).length === 1)
      this.$router.push({
        name: 'proposals',
        params: {
          key: Object.keys(this.namespaces)[0]
        }
      });
  }
};
</script>
