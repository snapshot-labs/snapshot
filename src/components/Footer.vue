<script setup>
import pkg from '@/../package.json';
const yearNow = new Date().getFullYear();
</script>

<template>
  <footer id="footer" class="border-t w-full mt-6 -mb-6 absolute bottom-0">
    <Container>
      <div class="flex items-center justify-between h-[120px]">
        <div>© {{ yearNow }} Snapshot Labs.</div>
        <div class="flex items-center">
          <div class="text-center space-x-3">
            <a href="https://twitter.com/SnapshotLabs" target="_blank">
              <Icon
                size="30"
                name="twitter"
                class="hover:opacity-80 text-skin-text"
              />
            </a>
            <a href="https://discord.gg/snapshot" target="_blank">
              <Icon
                size="30"
                name="discord"
                class="hover:opacity-80 text-skin-text"
              />
            </a>
            <a href="https://t.me/snapshotlabs" target="_blank">
              <Icon
                size="30"
                name="telegram"
                class="hover:opacity-80 text-skin-text"
              />
            </a>
            <a :href="`https://github.com/${pkg.repository}`" target="_blank">
              <Icon
                size="30"
                name="github"
                class="hover:opacity-80 text-skin-text"
              />
            </a>
            <a href="https://docs.snapshot.org/" target="_blank">
              <Icon
                size="30"
                name="gitbook"
                class="hover:opacity-80 text-skin-text"
              />
            </a>
          </div>
          <SelectLanguageButton class="ml-4" />
        </div>
      </div>
    </Container>
  </footer>
</template>
