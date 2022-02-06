<script setup>
import pkg from '@/../package.json';
</script>

<template>
  <footer id="footer" class="border-t w-full mt-6 -mb-6">
    <Container>
      <div class="flex items-center justify-between" style="height: 120px">
        <div>© Snapshot Labs., All rights reserved.</div>
        <div class="flex items-center">
          <div class="text-center space-x-3">
            <a href="https://twitter.com/SnapshotLabs" target="_blank">
              <Icon size="32" name="twitter" class="hover:opacity-80" />
            </a>
            <a href="https://discord.gg/snapshot" target="_blank">
              <Icon size="32" name="discord" class="hover:opacity-80" />
            </a>
            <a href="https://t.me/snapshotlabs" target="_blank">
              <Icon size="32" name="telegram" class="hover:opacity-80" />
            </a>
            <a :href="`https://github.com/${pkg.repository}`" target="_blank">
              <Icon size="32" name="github" class="hover:opacity-80" />
            </a>
            <a href="https://docs.snapshot.org/" target="_blank">
              <Icon size="32" name="gitbook" class="hover:opacity-80" />
            </a>
            <a href="https://gitcoin.co/grants/1093/snapshot" target="_blank">
              <Icon size="32" name="loveit" class="hover:opacity-80" />
            </a>
          </div>
          <SelectLanguageButton class="ml-4" />
        </div>
      </div>
    </Container>
  </footer>
</template>
