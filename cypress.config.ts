import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
const { defineGrepConfig } = require('@cypress/grep/src/plugin');

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
            defineGrepConfig(config);
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
