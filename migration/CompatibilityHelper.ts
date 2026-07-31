/**
 * Compatibility Shim for TypeScript 5.4 and Node.js LTS Upgrade
 * This helper addresses common breaking changes and streamlines migration:
 * - Provides package/class aliasing for renamed runtime APIs (if any).
 * - Wraps deprecated APIs now replaced/removed in TypeScript 5.4/Node.js LTS.
 * - Migrates config formats to the current expected formats, for tsconfig and engines.
 * - Flags all locations requiring manual attention with TODO referencing the specific change.
 *
 * NOTE:
 * - Only covers TypeScript/Node.js upgrade. Does NOT handle generator or template-specific logic.
 * - Review and revise generated or template configs, CI steps, and blueprints as per project requirements.
 */

import * as fs from "fs";
import * as path from "path";

/* ---- Deprecated API replacements & aliasing (as of TS 5.4/Node.js LTS) ---- */
/*
  As per current spec, no known changes to Node.js/TS standard libraries require runtime
  aliasing or replacement of core APIs. If a breaking API change is discovered in your
  codebase or dependencies, create a wrapper below, e.g.:

  // Example: Wrap renamed/deprecated APIs here as needed.
  // export const OldApi = NewApi; // TS/Node upgrade: actual mapping if any.

  // TODO: Review for any usage of deprecated TypeScript type utility APIs (e.g., NonNullable, Omit),
  // and wrap or polyfill as necessary if removed/changed in 5.4 (none known per official changelog).
*/

/* ---- Renamed packages/classes import shims ---- */
/*
  // If a dependency/package/class was renamed (common in some upgrades),
  // re-export or provide alias here. None required per provided spec.
  // TODO: If you use @types/node versions <22 and have package import issues,
  // manually update all imports to reflect new typings layout as needed.

  // Example:
  // export { newClassName as oldClassName } from 'new-package';
*/


/* ---- Config format migration helpers ---- */

export function migrateTsConfig(oldConfig: any): any {
    // Updates old tsconfig.json structure to be compatible with TypeScript 5.4

    let newConfig = { ...oldConfig };
    let changed = false;

    // Ensure new "compilerOptions" fields are present
    if (!newConfig.compilerOptions) {
        newConfig.compilerOptions = {};
        changed = true;
    }

    // Suggest update to at least "target": "ES2020" for Node.js LTS
    if (!newConfig.compilerOptions.target || newConfig.compilerOptions.target !== "ES2020") {
        newConfig.compilerOptions.target = "ES2020";
        changed = true;
    }

    // Suggest updated module mode (for latest Node.js)
    if (!newConfig.compilerOptions.module || newConfig.compilerOptions.module !== "NodeNext") {
        newConfig.compilerOptions.module = "NodeNext";
        changed = true;
    }

    // Remove deprecated compiler options (if present)
    if (newConfig.compilerOptions.outDir === undefined) {
        // No action
    } else if (typeof newConfig.compilerOptions.outDir === "string") {
        // outDir remains valid; do not remove by default
    }
    // Add more removals as needed per latest tsconfig reference

    // TODO: Review and manually migrate project references and "extends" fields
    // if you use advanced TS project setups (monorepo, etc).

    return changed ? newConfig : oldConfig;
}

export function migratePackageJson(oldPkg: any): any {
    // Updates engines and devDependencies for Node.js and TypeScript latest LTS requirements

    let newPkg = { ...oldPkg };
    let changed = false;

    // Ensure engines specify supported Node.js LTS
    if (!newPkg.engines) {
        newPkg.engines = {};
        changed = true;
    }
    // TODO: Set required LTS Node.js version specifically.
    // Replace the value below with your minimum supported LTS version.
    if (newPkg.engines.node !== ">=22.0.0") {
        newPkg.engines.node = ">=22.0.0";
        changed = true;
    }

    // TypeScript devDependency
    if (!newPkg.devDependencies) {
        newPkg.devDependencies = {};
        changed = true;
    }
    if (newPkg.devDependencies.typescript !== "^5.4.0") {
        newPkg.devDependencies.typescript = "^5.4.0";
        changed = true;
    }

    // TODO: Review and update all other (dev)dependencies for compatibility with Node/TS LTS.

    return changed ? newPkg : oldPkg;
}

/**
 * Applies all available migrations on recognized config files in a directory.
 * Warns and adds TODOs if file is missing or manual steps are required.
 */
export function migrateConfigsInPlace(projectDir: string): void {
    // tsconfig.json
    const tsConfigPath = path.join(projectDir, "tsconfig.json");
    if (fs.existsSync(tsConfigPath)) {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf8"));
        const newTsConfig = migrateTsConfig(tsConfig);
        if (JSON.stringify(tsConfig) !== JSON.stringify(newTsConfig)) {
            fs.writeFileSync(
                tsConfigPath,
                JSON.stringify(newTsConfig, null, 2) + "\n"
            );
            console.log(
                "tsconfig.json updated for TypeScript 5.4 and Node.js LTS compatibility."
            );
        }
    } else {
        // Not present, project may not be TypeScript yet
        // TODO: Create a tsconfig.json per TypeScript 5.4 standards if TypeScript is to be introduced here.
        console.warn("TODO: No tsconfig.json found; add one if TypeScript is used.");
    }

    // package.json
    const pkgPath = path.join(projectDir, "package.json");
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        const newPkg = migratePackageJson(pkg);
        if (JSON.stringify(pkg) !== JSON.stringify(newPkg)) {
            fs.writeFileSync(
                pkgPath,
                JSON.stringify(newPkg, null, 2) + "\n"
            );
            console.log(
                "package.json updated for TypeScript 5.4 and Node.js LTS compatibility."
            );
        }
    } else {
        // Project directory may not be initialized
        // TODO: Project is missing package.json; run `npm init` and add dependencies for TypeScript & Node.js LTS.
        console.warn("TODO: No package.json found; initialize your project with an up-to-date Node.js LTS environment.");
    }

    // Node engine versions in CI or Docker configs are out of scope for auto-migration; must review manually.
    // TODO: Manually update .nvmrc, .node-version, Dockerfile FROM lines, and CI workflow configs with correct Node.js LTS version.
}

/**
 * Utility: Print manual intervention checklist for TS/Node.js LTS upgrade.
 */
export function printManualInterventionChecklist() {
    console.log(`\n=== Manual Review Required for TypeScript 5.4 / Node.js LTS Upgrade ===
- [ ] Review and re-add .nvmrc, .node-version, and related version descriptor files per project policies (Spec: engines presence missing)
- [ ] Update Dockerfiles (FROM node:<LTS>) and all CI/CD workflows (GitHub Actions, etc) to use Node.js latest LTS
- [ ] Upgrade all npm (dev)dependencies for generators and templates (Spec: regular updates)
- [ ] Review all blueprints/scaffolded app templates (Angular, React, Spring Boot, etc) to use secure/correct/newest language and runtime features as appropriate
- [ ] Conduct code review and testing for any incompatibilities introduced by new TypeScript or Node.js versions (Spec: manual/code review/testing required)
- [ ] BCM (business capability model) trace: This feature flags GR-08 compliance gap – see research.md for rationale
`);
}

/* ---- Shim entry point (optional execution logic) ---- */
if (require.main === module) {
    // If script is run directly: operate in current directory
    const cwd = process.cwd();
    migrateConfigsInPlace(cwd);
    printManualInterventionChecklist();
}