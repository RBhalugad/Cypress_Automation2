// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';
import 'cypress-mochawesome-reporter/register';
import '@cypress/xpath';
import 'cypress-real-events/support';
import { register } from '@cypress/grep';
register();
import '@testing-library/cypress/add-commands';

/// <reference types="cypress"/>
/// <reference types="cypress-iframe"/>
/// <reference types="@testing-library/cypress"/>
/// <reference types="@cypress/xpath"/>
/// <reference types="cypress-real-events"/>
/// <reference types="@cypress/grep"/>
