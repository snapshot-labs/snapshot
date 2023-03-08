describe('connect wallet spec', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
    cy.resetMetamaskAccount();
  });

  it('should connect wallet with success', () => {
    cy.get('[data-testid="button-connect-wallet"]').click();
    cy.get('[data-testid="button-connnect-wallet-injected"]').click();
    cy.acceptMetamaskAccess();
  });
});
