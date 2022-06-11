/// <reference types="cypress" />


/**
 * work in progress
 */
describe('createProposal', () => {
  beforeEach(() => {
    cy.visit('/#/mktcode.eth')
  })

  it('shows warning and connect button when not connected', () => {
    cy.get('[data-testid="create-proposal-button"]').click()
    cy.get('[data-testid="create-proposal-connect-wallet-warning"]').should('exist')
    cy.get('[data-testid="create-proposal-connect-wallet-button"]').should('exist')
  })
})
