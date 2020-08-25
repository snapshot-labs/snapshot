<template>
  <div>
    <Container :slim="true">
      <router-link
        v-for="namespace in namespaces"
        :key="namespace.address"
        :to="{ name: 'proposals', params: { key: namespace.key } }"
      >
        <Block class="text-center">
          <Token :address="namespace.image" size="96" class="mb-4" />
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
      namespaces: Object.fromEntries(
        Object.entries(namespaces).filter(namespace => namespace[1].visible)
      )
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
