// Archive the current public surface under the version being published.
//
// `docs/public-surface.snapshot.json` only ever describes HEAD, so it cannot answer
// "what changed between the version I have and the version I want". Keeping one copy per
// released version is what makes the migration planner (src/routes/api/migration.ts)
// mechanical instead of hand-written. Runs from `prepack`, so a release cannot forget it.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SURFACES_DIR = join('src', 'docs', 'migrations', 'surfaces');

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const snapshot = JSON.parse(readFileSync(join('docs', 'public-surface.snapshot.json'), 'utf8'));
const target = join(SURFACES_DIR, `${version}.json`);

if (existsSync(target) && !process.argv.includes('--force')) {
	console.log(`[archive-surface] ${version} already archived; pass --force to overwrite.`);
	process.exit(0);
}

writeFileSync(target, `${JSON.stringify({ version, ...snapshot }, null, '\t')}\n`);
console.log(`[archive-surface] wrote ${target}`);
