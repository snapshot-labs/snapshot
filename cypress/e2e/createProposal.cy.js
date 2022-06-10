/// <reference types="cypress" />


/**
 * work in progress
 */
describe('createProposal', () => {
  beforeEach(() => {
    cy.visit('/#/mktcode.eth')
  })

  it('shows correct error when trying to create a proposal without being connected and opens connect modal when clicking button in sidebar', () => {
    cy.get('.sidenav-item[href="#/mktcode.eth/create"]').should('have.length', 1).first().click()
    cy.get('#content-left span:contains(You need to have a minimum of 10 MKT in order to submit a proposal.)').should('exist')
    cy.get('#sidebar-right button:contains(Connect wallet)').should('exist').click()
    cy.get('.modal h3:contains(Connect wallet)').should('exist')
  })
})
