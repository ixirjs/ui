// Record the built publication contract. Historical name-only archives under src/docs are
// intentionally untouched: they are not verified release history. Never overwrite a version.
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { archive, inspectPackage } from './api-contract.mjs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const directory = join('docs', 'api', 'releases');
mkdirSync(directory, { recursive: true });
const target = join(directory, `${version}.json`);
archive(target, { version, ...inspectPackage() });
console.log(`[archive-surface] verified immutable publication contract ${target}`);
