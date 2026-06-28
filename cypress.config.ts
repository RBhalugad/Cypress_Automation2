import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
const { plugin: grepPlugin } = require('@cypress/grep/plugin');

dotenv.config();

export default defineConfig({
    projectId: 'tjezyk',
    viewportHeight: 1080,
    viewportWidth: 1920,
    defaultCommandTimeout: 30_000,
    pageLoadTimeout: 60_000,
    requestTimeout: 30_000,
    responseTimeout: 60_000,
    retries: { runMode: 2, openMode: 0 },
    chromeWebSecurity: false,
    env: {
        baseurl: 'https://rahulshettyacademy.com',
        ecom_user: 'randhirpatel.naukri@gmail.com',
        ecom_password: 'Pixel8@2024',
        apiUrl: 'https://jsonplaceholder.typicode.com',
        authToken: 'your-token-here',
        apiKey: 'your-api-key',
    },
    reporter: 'cypress-mochawesome-reporter',
    e2e: {
        specPattern: 'cypress/e2e/**/*.spec.ts',
        allowCypressEnv: false,
        setupNodeEvents(on, config) {
            require('cypress-mochawesome-reporter/plugin')(on);
            grepPlugin(on, config);
            on('task', {
                deleteDownloads() {
                    const folderPath = 'cypress/downloads';
                    if (fs.existsSync(folderPath)) {
                        fs.rmSync(folderPath, { recursive: true, force: true });
                    }
                    return null;
                },
                readDownloads(fileName: string) {
                    const filePath = `cypress/downloads/${fileName}`;
                    const timeout = 10000;
                    const interval = 300;
                    const start = Date.now();
                    return new Promise((resolve) => {
                        const check = () => {
                            if (fs.existsSync(filePath)) {
                                resolve(fs.readFileSync(filePath));
                            } else if (Date.now() - start >= timeout) {
                                resolve(null);
                            } else {
                                setTimeout(check, interval);
                            }
                        };
                        check();
                    });
                },
            });
            return config;
        },
    },
});
