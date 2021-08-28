<template>
  <div class="border-bottom py-8">
    <Container class="clearfix">
      <div class="col-6 float-left">
        <h1 class="mono mb-5">Where decisions get made</h1>
        <p class="mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div class="col-6 float-left">
        <div
          class="placeholder float-right"
          style="width: 380px; height: 240px"
        />
      </div>
    </Container>
  </div>
  <div class="border-bottom balancer bg py-8">
    <Container>
      <div class="col-6">
        <div class="eyebrow mb-2">Who we work with</div>
      </div>
    </Container>
  </div>
  <div class="border-bottom py-6">
    <Container>
      <div class="clearfix py-6">
        <div class="col-6 pr-8 float-left">
          <div class="placeholder" style="width: 340px; height: 180px" />
        </div>
        <div class="col-6 pr-8 float-left">
          <div class="eyebrow mb-2">What</div>
          <h1 class="mono h2 mb-4">Flexible</h1>
          <p>
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua,
            lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <a>Learn more</a>
        </div>
      </div>
      <div class="clearfix py-6">
        <div class="col-6 pr-8 float-left">
          <div class="eyebrow mb-2">How</div>
          <h1 class="mono h2 mb-4">Secure</h1>
          <p>
            Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua, lorem ipsum dolor sit amet.
          </p>
          <a>Learn more</a>
        </div>
        <div class="col-6 float-left">
          <div
            class="placeholder float-right"
            style="width: 340px; height: 180px"
          />
        </div>
      </div>
      <div class="clearfix py-6">
        <div class="col-6 pr-8 float-left">
          <div class="placeholder" style="width: 340px; height: 180px" />
        </div>
        <div class="col-6 pr-8 float-left">
          <div class="eyebrow mb-2">Why</div>
          <h1 class="mono h2 mb-4">Open</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <a>Learn more</a>
        </div>
      </div>
    </Container>
  </div>
  <div class="border-bottom balancer bg py-8">
    <Container class="clearfix">
      <div class="eyebrow mb-2">Get started</div>
    </Container>
  </div>
  <div class="py-8">
    <Container class="text-right">
      <a href="https://twitter.com/SnapshotLabs" target="_blank">
        <Icon size="32" name="twitter" class="mr-1 mx-2" />
      </a>
      <a href="https://discord.snapshot.org" target="_blank">
        <Icon size="32" name="discord" class="mr-1 mx-2" />
      </a>
      <a href="https://t.me/snapshotlabs" target="_blank">
        <Icon size="32" name="telegram" class="mr-1 mx-2" />
      </a>
      <a :href="`https://github.com/snapshot-labs`" target="_blank">
        <Icon size="32" name="github" class="mr-1 mx-2" />
      </a>
    </Container>
  </div>
</template>

<style>
.placeholder {
  background-color: var(--border-color);
}
</style>
