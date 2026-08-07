```javascript
const pa11y = require('pa11y');

async function runAccessibilityTest(url) {
    try {
        const results = await pa11y(url, {
            standard: 'WCAG2AA',
            includeNotices: true,
            includeWarnings: true
        });

        console.log(`Accessibility Test Results for ${url}:`);
        console.log(JSON.stringify(results, null, 2));

        const errors = results.issues.filter(issue => issue.type === 'error');
        if (errors.length > 0) {
            console.error('Accessibility test failed: Page does not meet WCAG 2.1 AA standards');
        } else {
            console.log('Accessibility test passed: Page meets WCAG 2.1 AA standards');
        }
    } catch (error) {
        console.error(`Error running accessibility test: ${error.message}`);
    }
}

runAccessibilityTest('http://localhost:3000/profile');
```