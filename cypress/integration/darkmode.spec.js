/// <reference types="cypress" />

/**
 * This test assumes the operating system's theme is light.
 */
describe('darkmode', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays a button that toggles dark mode', () => {
    cy.get('#app > .light-mode').should('have.length', 1)
    cy.get('[aria-label="Toggle skin"]').should('have.length', 1).first().click()
    cy.get('#app > .light-mode').should('have.length', 0)
    cy.get('#app > .dark-mode').should('have.length', 1)
  })
})
