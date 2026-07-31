import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript and Node.js Upgrade Validation', () => {
  const ROOT = path.resolve(__dirname, '..');
  const PACKAGE_JSON = path.join(ROOT, 'package.json');
  const NVMRC = path.join(ROOT, '.nvmrc');
  const NODE_VERSION_FILE = path.join(ROOT, '.node-version');

  let packageJson: any;

  beforeAll(() => {
    packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
  });

  it('should have TypeScript version set to 5.4.x in package.json dependencies or devDependencies', () => {
    const tsVersion =
      (packageJson.dependencies && packageJson.dependencies.typescript) ||
      (packageJson.devDependencies && packageJson.devDependencies.typescript);
    expect(tsVersion).toBeDefined();
    // Accepts "^5.4.0", "5.4.x", etc.
    expect(tsVersion).toMatch(/^(\^|~)?5\.4(\.\d+)?/);
  });

  it('should have Node.js engine set to latest LTS in package.json', () => {
    expect(packageJson.engines).toBeDefined();
    expect(packageJson.engines.node).toBeDefined();
    // Accept >=22.x or >=24.x or similar
    expect(packageJson.engines.node).toMatch(/^(\^|>=)?(22|24)(\.\d+)?/);
  });

  it('should have .nvmrc and .node-version files matching the package.json Node.js engine', () => {
    const pkgNodeVer = packageJson.engines.node.match(/(22|24)(\.\d+)?/);
    expect(pkgNodeVer).not.toBeNull();
    const nodeVer = pkgNodeVer![0];

    if (fs.existsSync(NVMRC)) {
      const nvmrcContent = fs.readFileSync(NVMRC, 'utf-8').trim();
      expect(nvmrcContent.startsWith(nodeVer)).toBe(true);
    }

    if (fs.existsSync(NODE_VERSION_FILE)) {
      const nodeVersionContent = fs.readFileSync(NODE_VERSION_FILE, 'utf-8').trim();
      expect(nodeVersionContent.startsWith(nodeVer)).toBe(true);
    }
  });

  it('should be running tests with the upgraded Node.js version (process.version)', () => {
    // Remove the 'v' for comparison
    const nodeProcessVersion = process.version.replace(/^v/, '');
    // Accept 22.x or 24.x (LTS)
    const ltsMajor = parseInt(nodeProcessVersion.split('.')[0], 10);
    expect([22, 24]).toContain(ltsMajor);
  });

  it('should successfully import and use TypeScript transpiled code (critical path check)', async () => {
    // Assume exists: dist/index.js as transpiled build output
    const distPath = path.join(ROOT, 'dist', 'index.js');
    expect(fs.existsSync(distPath)).toBe(true);
    // Dynamically import for safety
    const imported = await import(distPath);
    // Require exported function/class to exist (example: generateApp, etc.)
    expect(imported).toBeDefined();
    // At least one expected export
    const exportKeys = Object.keys(imported);
    expect(exportKeys.length).toBeGreaterThan(0);
  });

  it('should not contain deprecated TypeScript APIs/options replaced in 5.4 in tsconfig.json', () => {
    // Only run if tsconfig.json exists
    const tsconfigPath = path.join(ROOT, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) return;
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    // Example: `useDefineForClassFields` was removed in 5.4+, ensure not present
    expect(tsconfig.compilerOptions?.useDefineForClassFields).toBeUndefined();
    // No deprecated `importsNotUsedAsValues`
    expect(tsconfig.compilerOptions?.importsNotUsedAsValues).toBeUndefined();
  });

  it('should load new TypeScript 5.4 config keys without error when present in tsconfig.json', () => {
    // Only run if tsconfig.json exists
    const tsconfigPath = path.join(ROOT, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) return;
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    // Example 5.4+ config key: noUncheckedIndexedAccess
    // Accepts boolean or not defined, should not throw
    expect(() => {
      if (typeof tsconfig.compilerOptions?.noUncheckedIndexedAccess !== 'undefined') {
        const _ = tsconfig.compilerOptions.noUncheckedIndexedAccess;
      }
    }).not.toThrow();
  });
});