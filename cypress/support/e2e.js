import './commands';
import '@synthetixio/synpress/support';

beforeEach(() => {
  cy.visit('/');
  cy.get('[data-testid="button-connect-wallet"]').click();
  cy.get('[data-testid="button-connnect-wallet-injected"]').click();
  cy.acceptMetamaskAccess();
});

afterEach(() => {
  cy.disconnectMetamaskWalletFromAllDapps();
  cy.resetMetamaskAccount();
});
