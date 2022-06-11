import { defineConfig } from 'cypress'

export default defineConfig({
  viewportHeight: 900,
  viewportWidth: 1280,
  screenshotOnRunFailure: false,
  video: false,
  defaultCommandTimeout: 10000,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000',
    supportFile: false,
  },
})
