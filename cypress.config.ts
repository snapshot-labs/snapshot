const { defineConfig } = require('cypress');
const synpressPlugins = require('@synthetixio/synpress/plugins');

module.exports = defineConfig({
  userAgent: 'synpress',
  viewportHeight: 900,
  viewportWidth: 1280,
  screenshotOnRunFailure: false,
  video: false,
  chromeWebSecurity: true,
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 30000,
  requestTimeout: 30000,
  e2e: {
    testIsolation: true,
    setupNodeEvents(on, config) {
      synpressPlugins(on, config);
    },
    baseUrl: 'http://localhost:8081/#/',
    supportFile: 'cypress/support/e2e.js'
    // specPattern: 'cypress/e2e/voting-proposal.spec.cy.js'
  }
});
