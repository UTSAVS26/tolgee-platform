import {
  cleanSingleData,
  generateSingleData,
  login,
} from '../../common/apiCalls';
import {
  editCell,
  toggleLang,
  visitTranslations,
} from '../../common/translations';
import { visitSingleKey } from '../../common/singleKey';
import { assertMessage, confirmStandard } from '../../common/shared';
import { waitForGlobalLoading } from '../../common/loading';

describe('Single key form', () => {
  let projectId: number;

  beforeEach(() => {
    cleanSingleData();
    generateSingleData().then((data) => {
      projectId = data.body.id;
    });
  });

  afterEach(() => {
    waitForGlobalLoading();
    cleanSingleData();
  });

  it('will create translation with EDIT permissions', () => {
    logInAs('pepa');
    createKey();
  });

  it('will edit translation with EDIT permissions', () => {
    logInAs('pepa');
    visitEditKey();
    editKey();
    editTranslation();
    removeKey();
  });

  it("can't add key with TRANSLATE permissions", () => {
    logInAs('jindra');
    visitSingleKey(projectId, 'testkey');
    assertMessage('insufficient permissions');
  });

  it("can't edit key with TRANSLATE permissions", () => {
    logInAs('jindra');
    visitEditKey();
    cantEditKey();
    editTranslation();
    cantRemoveKey();
  });

  it("can't edit translation with VIEW permissions", () => {
    logInAs('vojta');
    visitEditKey();
    cantEditKey();
    cantEditTranslation();
    cantRemoveKey();
  });

  it('will use language select correctly', () => {
    logInAs('franta');
    // changing langs in translations list should influnece
    // default language in localstorage
    visitTranslations(projectId);
    languageIsSelected('cs');
    languageIsSelected('en');
    toggleLang('Czech');

    // translation single view should take settings from localstorage
    // but't not modify them
    visitSingleKey(projectId, 'A key');
    languageIsSelected('en');
    languageIsNotSelected('cs');
    toggleLang('Czech');

    visitTranslations(projectId);
    languageIsSelected('en');
    languageIsNotSelected('cs');
  });

  function languageIsSelected(lang: string) {
    cy.gcy('translations-table-cell-language')
      .contains(lang)
      .should('be.visible');
  }

  function languageIsNotSelected(lang: string) {
    cy.gcy('translations-table-cell-language')
      .contains(lang)
      .should('not.exist');
  }

  function logInAs(user: string) {
    login(user, 'admin');
  }

  function createKey() {
    visitSingleKey(projectId, 'testkey', ['en']);
    cy.gcy('translation-field-label').contains('English').should('be.visible');
    cy.gcy('translations-tag-input').type('cooltag');
    cy.gcy('tag-autocomplete-option').contains('Add "cooltag"').click();
    cy.gcy('translation-create-translation-input').type('cooltranslation');
    cy.gcy('global-form-save-button').click();
    assertMessage('Key created');
    cy.gcy('translations-table-cell').contains('testkey').should('be.visible');
    cy.gcy('translations-tag').contains('cooltag').should('be.visible');
    cy.gcy('translations-table-cell')
      .contains('cooltranslation')
      .should('be.visible');
  }

  function visitEditKey() {
    visitSingleKey(projectId, 'A key', ['en']);
  }

  function editKey() {
    cy.contains('Z translation').should('be.visible');
    editCell('A key', 'Edited A key');
    cy.gcy('translation-edit-key-field')
      .contains('Edited A key')
      .should('be.visible');
  }

  function cantEditKey() {
    cy.gcy('translations-table-cell').contains('A key').should('be.visible');
    cy.gcy('global-editor').should('not.exist');
  }

  function editTranslation() {
    editCell('Z translation', 'Edited Z translation');
    cy.gcy('translation-edit-translation-field')
      .contains('Edited Z translation')
      .should('be.visible');
  }

  function cantEditTranslation() {
    cy.gcy('translations-table-cell')
      .contains('Z translation')
      .should('be.visible');
    cy.gcy('global-editor').should('not.exist');
  }

  function removeKey() {
    cy.gcy('translation-edit-delete-button').click();
    confirmStandard();
    assertMessage('Key deleted');
  }

  function cantRemoveKey() {
    cy.gcy('translation-edit-delete-button').should('not.exist');
  }
});
