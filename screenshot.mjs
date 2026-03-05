import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const isMobile = label.includes('mobile') || process.argv[4] === 'mobile';

const screenshotDir = './temporary screenshots';
if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true });
}

// Get next available screenshot number
const files = existsSync(screenshotDir) ? readdirSync(screenshotDir) : [];
const screenshotNumbers = files
    .filter(f => f.startsWith('screenshot-'))
    .map(f => {
        const match = f.match(/screenshot-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    });
const nextNumber = screenshotNumbers.length > 0 ? Math.max(...screenshotNumbers) + 1 : 1;

const filename = label
    ? `screenshot-${nextNumber}-${label}.png`
    : `screenshot-${nextNumber}.png`;

const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Users/pgaud/.cache/puppeteer/chrome/win64-145.0.7632.77/chrome-win64/chrome.exe'
});

const page = await browser.newPage();

if (isMobile) {
    await page.setViewport({
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
    });
} else {
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
    });
}

await page.goto(url, { waitUntil: 'networkidle0' });
await page.screenshot({
    path: join(screenshotDir, filename),
    fullPage: true
});

console.log(`Screenshot saved: ${join(screenshotDir, filename)}`);
await browser.close();
