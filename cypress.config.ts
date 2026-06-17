import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    projectId: 'tjezyk',
    viewportHeight: 911,
    viewportWidth: 1920,
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 60000,
    chromeWebSecurity: false,
    env: {
        baseurl: 'https://rahulshettyacademy.com',
        ecom_user: 'randhirpatel.naukri@gmail.com',
        ecom_password: 'Pixel8@2024',
    },
    reporter: 'cypress-mochawesome-reporter',
    e2e: {
        specPattern: 'cypress/e2e/**/*.spec.ts',
        experimentalStudio: true,
        setupNodeEvents(on, config) {
            require('cypress-mochawesome-reporter/plugin')(on);
            return config;
        },
    },
});
