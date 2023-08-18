describe('create proposal', () => {
  it('should create a proposal with three different spaces', () => {
    ['/test1.testsnap.eth', '/test2.testsnap.eth'].forEach(space => {
      // First space is a default space, with no validation settings
      // Third space is a custom space, with validation settings (only authors)
      cy.visit(space);
      cy.get('[data-testid="create-proposal-button"]').click();
      cy.get('[data-testid="input-proposal-title"]').type('Hello, World');
      cy.get('[data-testid="input-proposal-body"]').clear();
      cy.get('[data-testid="input-proposal-body"]').type(
        'Lorem ipsum dolor sit amet consectetur adipisicing elit.'
      );
      cy.get('[data-testid="input-proposal-discussion"]').type(
        'https://google.com'
      );
      cy.get('[data-testid="create-proposal-continue-button"]').click();
      cy.get('[data-testid="input-proposal-choice-0"]').type('Alice');
      cy.get('[data-testid="input-proposal-choice-1"]').type('Bob');
      cy.get('[data-testid="create-proposal-publish-button"]').click();

      cy.confirmMetamaskDataSignatureRequest();

      cy.get('[data-testid="proposal-page-title"]').should(
        'include.text',
        'Hello, World'
      );
      cy.get('[data-testid="proposal-page-content"]').should(
        'include.text',
        'Lorem ipsum dolor sit amet consectetur adipisicing elit.'
      );
      cy.get('[data-testid="proposal-page-discussion-link"]').should(
        'include.text',
        'Google'
      );
    });
  });
});
