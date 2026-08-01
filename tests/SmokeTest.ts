import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('Post-upgrade Validation: TypeScript 5.4 & Node.js 22/24 Migration', () => {
  // Adjust if you have stricter environments
  const TARGET_TYPESCRIPT_VERSION = '5.4';
  // Accepts either 22.x or 24.x
  const TARGET_NODE_VERSIONS = ['22.', '24.'];

  function getTypescriptVersion() {
    try {
      const out = execSync('npx tsc --version', { encoding: 'utf8' });
      const match = out.match(/Version (\d+\.\d+)/);
      return match ? match[1] : null;
    } catch (err) {
      return null;
    }
  }

  function getNodeVersion() {
    const nodeVersion = process.version.replace(/^v/, '');
    return nodeVersion;
  }

  function getTsConfig() {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      return JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
    }
    return null;
  }

  function getPackageJson() {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    }
    return null;
  }

  it('should be running the target TypeScript version (5.4.x)', () => {
    const typescriptVersion = getTypescriptVersion();
    expect(typescriptVersion).toBeDefined();
    expect(typescriptVersion?.startsWith(TARGET_TYPESCRIPT_VERSION)).toBe(true);
  });

  it('should be running Node.js 22.x or 24.x', () => {
    const nodeVersion = getNodeVersion();
    expect(TARGET_NODE_VERSIONS.some(prefix => nodeVersion.startsWith(prefix))).toBe(true);
  });

  it('should have updated TypeScript and Node.js versions in package.json/engines', () => {
    const pkg = getPackageJson();
    expect(pkg).toBeDefined();
    if (pkg?.devDependencies?.typescript || pkg?.dependencies?.typescript) {
      const version =
        pkg.devDependencies?.typescript || pkg.dependencies?.typescript;
      expect(version).toMatch(/^(\^|~)?5\.4(\.\d+)?/);
    }
    if (pkg?.engines?.node) {
      const matches = TARGET_NODE_VERSIONS.some(v =>
        pkg.engines.node.includes(v),
      );
      expect(matches).toBe(true);
    }
  });

  it('should build a sample TypeScript file using tsc without errors', () => {
    const testFile = path.join(__dirname, '__ts54_compile_check.ts');
    const sampleSource = `
      type Example = { a: number; b?: string; };
      const f = (x: Example) => x.a + (x.b?.length ?? 0);
      export default f;
    `;
    fs.writeFileSync(testFile, sampleSource);
    let result;
    try {
      result = execSync(
        `npx tsc --strict --target ES2022 --module commonjs ${testFile}`,
        { encoding: 'utf8', stdio: 'pipe' },
      );
    } catch (err) {
      fs.unlinkSync(testFile);
      throw err;
    }
    fs.unlinkSync(testFile);
    expect(result).toBeDefined();
  });

  it('should no longer allow deprecated TypeScript 5.4 APIs (e.g., "node:domain")', () => {
    // Check that none of the known removed APIs appear in package.json, imports, or code
    const pkg = getPackageJson();
    if (pkg) {
      expect(JSON.stringify(pkg)).not.toMatch(/node:domain/);
    }
    // Optionally scan typical code locations for `import ... from 'node:domain'`
    const srcDir = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcDir)) {
      const files = fs
        .readdirSync(srcDir)
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
      files.forEach((f) => {
        const source = fs.readFileSync(path.join(srcDir, f), 'utf-8');
        expect(source).not.toMatch(/['"]node:domain['"]/);
      });
    }
  });

  it('should accept new TypeScript 5.4 config keys in tsconfig.json', () => {
    // "noUncheckedIndexedAccess" is a new option as of TS 4.1, for 5.4, "verbatimModuleSyntax" or "emitDecoratorMetadata" with new semantics may apply
    const tsconfig = getTsConfig();
    expect(tsconfig).toBeDefined();
    // Example new key: verbatimModuleSyntax
    if ('verbatimModuleSyntax' in tsconfig!) {
      expect(typeof tsconfig!['verbatimModuleSyntax']).toBe('boolean');
    }
  });

  it('should allow new REST API endpoints to compile and run on Node.js 22/24', async () => {
    // Assume a simple express REST endpoint exists in src/app.ts
    // The actual project may have a different path - adapt as needed
    const appPath = path.join(process.cwd(), 'src', 'app.ts');
    if (!fs.existsSync(appPath)) return;
    let compiledPath: string = '';
    try {
      execSync(`npx tsc ${appPath} --outDir temp-test-dist`, { stdio: 'pipe' });
      compiledPath = path.join(process.cwd(), 'temp-test-dist', 'src', 'app.js');
      expect(fs.existsSync(compiledPath)).toBe(true);
    } finally {
      if (compiledPath) {
        fs.rmSync(path.join(process.cwd(), 'temp-test-dist'), { recursive: true, force: true });
      }
    }
  });
});