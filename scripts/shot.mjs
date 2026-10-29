import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const [path = '/', out = 'shot.png', theme = 'light', width = '1440', height = '900', signedIn = 'yes'] = process.argv.slice(2);
const base = process.env.CONDOR_CONSOLE ?? 'http://localhost:5190';
const token = signedIn === 'yes' ? readFileSync(new URL('../.scratch/token', import.meta.url), 'utf8').trim() : null;

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) }, colorScheme: theme });
const problems = [];
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
    if(message.type() === 'error') problems.push(`console: ${message.text()}`);
});
await page.addInitScript(([value, mode]) => {
    if(value) localStorage.setItem('condor.session', value);
    localStorage.setItem('condor.theme', mode);
}, [token, theme]);
await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: out, fullPage: false });
console.log(problems.length === 0 ? 'ok' : problems.slice(0, 8).join('\n'));
await browser.close();
