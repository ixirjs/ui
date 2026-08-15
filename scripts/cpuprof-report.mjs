/**
 * Aggregates a V8 `.cpuprofile` into self-time per function. Reads the newest profile in a
 * directory, or a file path given as the first argument.
 *
 * `node scripts/cpuprof-report.mjs .bench-out/profile [topN]`
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const target = process.argv[2] ?? '.bench-out/profile';
const topN = Number(process.argv[3] ?? 30);

const file = statSync(target).isDirectory()
	? readdirSync(target)
			.filter((name) => name.endsWith('.cpuprofile'))
			.map((name) => join(target, name))
			.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
	: target;

const profile = JSON.parse(readFileSync(file, 'utf8'));

// `timeDeltas[i]` is the interval BEFORE sample `i`, so it is the time attributed to that sample's
// node. Summing per node id gives self time; the tree's `children` are only needed for naming.
const selfByNode = new Map();
for (let i = 0; i < profile.samples.length; i++) {
	const id = profile.samples[i];
	selfByNode.set(id, (selfByNode.get(id) ?? 0) + (profile.timeDeltas[i] ?? 0));
}

const label = (node) => {
	const f = node.callFrame;
	const name = f.functionName || '(anonymous)';
	const url = (f.url || '').replace(/^file:\/\/.*?\/(\.bench-out|node_modules)\//, '$1/');
	return `${name}  ${url}:${f.lineNumber + 1}`;
};

const selfByLabel = new Map();
let total = 0;
for (const node of profile.nodes) {
	const self = selfByNode.get(node.id) ?? 0;
	if (self === 0) continue;
	total += self;
	const key = label(node);
	selfByLabel.set(key, (selfByLabel.get(key) ?? 0) + self);
}

const rows = [...selfByLabel].sort((a, b) => b[1] - a[1]).slice(0, topN);
console.log(`\n${file}   ${(total / 1000).toFixed(0)} ms sampled\n`);
console.log('   self%      ms   function');
for (const [key, self] of rows) {
	console.log(
		`  ${((self / total) * 100).toFixed(2).padStart(6)}%  ${(self / 1000).toFixed(0).padStart(6)}   ${key}`
	);
}
console.log('');
