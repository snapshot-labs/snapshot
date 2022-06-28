/// <reference types="cypress" />

/**
 * work in progress
 */
describe('createProposal', () => {
  beforeEach(() => {
    cy.visit('/#/fabien.eth');
  });

  it('shows warning and connect button when not connected', () => {
    cy.get('[data-testid="create-proposal-button"]').click();
    cy.get('[data-testid="create-proposal-connect-wallet-button"]').should(
      'exist'
    );
  });
});
