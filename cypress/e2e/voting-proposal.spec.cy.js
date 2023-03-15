describe('voting', () => {
  it('should vote on a single choice proposal', () => {
    cy.visit(
      'pistachiodao.eth/proposal/0x02c3fcd64e86157d07c88e5a715ac08f57655917f8bfd5be30a99092136511ec'
    );
    cy.get('[data-testid="proposal-page-title"]').should(
      'include.text',
      'Single choice voting demo'
    );
    cy.get('[data-testid="sc-choice-button-1"]').click();
    cy.get('[data-testid="sc-choice-button-1"]').should(
      'have.class',
      '!border-skin-link'
    );
    cy.get('[data-testid="proposal-vote-button"]').click();
    cy.get('[data-testid="confirm-vote-button"]').click();
    cy.confirmMetamaskDataSignatureRequest().then(confirmed => {
      expect(confirmed).to.be.true;
    });
    cy.get('[data-testid="post-vote-modal-close"]').click();
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      'You'
    );
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      'Bob'
    );
  });

  it('should vote on a approval proposal', () => {
    cy.visit(
      'pistachiodao.eth/proposal/0x08c3bd2960700525770a1d634f8599ba967e55fcc05b6c1649d984d88253769d'
    );
    cy.get('[data-testid="proposal-page-title"]').should(
      'include.text',
      'Approval voting demo'
    );
    cy.get('[data-testid="proposal-votes-list-item-0"]').should('be.visible');
    cy.get('[data-testid="approval-choice-list"]>button').each($el => {
      if ($el[0].className.includes('!border-skin-link')) {
        cy.wrap($el).click();
      }
      cy.wrap($el).should('not.have.class', '!border-skin-link');
    });
    cy.get('[data-testid="approval-choice-button-1"]').click();
    cy.get('[data-testid="approval-choice-button-1"]').should(
      'have.class',
      '!border-skin-link'
    );
    cy.get('[data-testid="approval-choice-button-0"]').click();
    cy.get('[data-testid="approval-choice-button-0"]').should(
      'have.class',
      '!border-skin-link'
    );
    cy.get('[data-testid="proposal-vote-button"]').click();
    cy.get('[data-testid="confirm-vote-button"]').click();
    cy.confirmMetamaskDataSignatureRequest().then(confirmed => {
      expect(confirmed).to.be.true;
    });
    cy.get('[data-testid="post-vote-modal-close"]').click();
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      'You'
    );
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      'Article 1, Article 2'
    );
  });

  it('should vote on a quadratic proposal', () => {
    cy.visit(
      'pistachiodao.eth/proposal/0x21f64875abbca71762a980efae43ab62b546d54f19a208d0e61a5d7cee571a35'
    );
    cy.get('[data-testid="proposal-page-title"]').should(
      'include.text',
      'Quadratic voting demo'
    );
    cy.get('[data-testid="proposal-votes-list-item-0"]').should('be.visible');
    cy.get('[data-testid="quadratic-choice-list"]>button').each(
      ($el, index) => {
        if ($el[0].className.includes('!border-skin-link')) {
          cy.get(`[data-testid="quadratic-input-${index}"]`).clear();
        }
        cy.wrap($el).should('not.have.class', '!border-skin-link');
      }
    );
    cy.get('[data-testid="quadratic-add-button-0"]').click();
    cy.get('[data-testid="quadratic-choice-button-0"]').should(
      'have.class',
      '!border-skin-link'
    );
    cy.get('[data-testid="quadratic-add-button-1"]').click();
    cy.get('[data-testid="quadratic-choice-button-1"]').should(
      'have.class',
      '!border-skin-link'
    );
    cy.get('[data-testid="quadratic-choice-button-0"]').should(
      'include.text',
      '50%'
    );
    cy.get('[data-testid="quadratic-choice-button-1"]').should(
      'include.text',
      '50%'
    );
    cy.get('[data-testid="proposal-vote-button"]').click();
    cy.get('[data-testid="confirm-vote-button"]').click();
    cy.confirmMetamaskDataSignatureRequest().then(confirmed => {
      expect(confirmed).to.be.true;
    });
    cy.get('[data-testid="post-vote-modal-close"]').click();
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      'You'
    );
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      '50% for PistachioSwap, 50% for Pistachio UBI'
    );
  });

  it('should vote on a ranked-choice proposal', () => {
    cy.visit(
      'pistachiodao.eth/proposal/0x5003da0f03e718b461e53fe10a998b60172e2e108472153282fcef781c300f23'
    );
    cy.get('[data-testid="proposal-page-title"]').should(
      'include.text',
      'Ranked-choice voting demo'
    );
    cy.get('[data-testid="proposal-votes-list-item-0"]').should('be.visible');
    cy.get('[data-testid="ranked-choice-selected-list"]').then($list => {
      if ($list[0].children.length > 0) {
        cy.get('[data-testid="ranked-choice-selected-list"]>button').each(
          $el => {
            if ($el[0].className.includes('!border-skin-link')) {
              cy.get(`[data-testid="ranked-choice-selected-delete-0"]`).click();
            }
          }
        );
      }
      cy.wrap($list).children().should('have.length', 0);
    });
    cy.get('[data-testid="ranked-choice-select-list"]>button').each($el => {
      cy.wrap($el).should('be.visible');
      cy.wrap($el).click();
    });
    cy.get('[data-testid="proposal-vote-button"]').click();
    cy.get('[data-testid="confirm-vote-button"]').click();
    cy.confirmMetamaskDataSignatureRequest().then(confirmed => {
      expect(confirmed).to.be.true;
    });
    cy.get('[data-testid="post-vote-modal-close"]').click();
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      'You'
    );
    cy.get('[data-testid="proposal-votes-list-item-0"]').should(
      'include.text',
      '(1st) Alice, (2nd) Bob, (3rd) Carol, (4th) David'
    );
  });
});
