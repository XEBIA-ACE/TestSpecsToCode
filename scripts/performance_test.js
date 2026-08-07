```javascript
const puppeteer = require('puppeteer');

async function runPerformanceTest(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const startTime = new Date().getTime();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const endTime = new Date().getTime();

    const loadTime = endTime - startTime;

    console.log(`Page loaded in ${loadTime}ms`);
    if (loadTime > 2000) {
        console.error('Performance test failed: Profile page load time exceeds 2 seconds');
    } else {
        console.log('Performance test passed: Profile page load time is under 2 seconds');
    }

    await browser.close();
}

runPerformanceTest('http://localhost:3000/profile');
```