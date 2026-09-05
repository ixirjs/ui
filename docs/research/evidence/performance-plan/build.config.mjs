import config from '../../../../scripts/bench-client.vite.config.ts';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const files = [
	'capability/models/disclosure.svelte.ts',
	'capability/models/selection.svelte.ts',
	'capability/models/roving.svelte.ts',
	'components/accordion/bond.svelte.ts',
	'components/tree/bond.svelte.ts',
	'utils/animate.ts',
	'preset/context.svelte.ts',
	'kernel/kernel.svelte.ts',
	'kernel/resolve/preset.ts'
];
const sources = new Map(
	process.env.BENCH_REFERENCE
		? files.map((file) => [
				root + 'src/lib/' + file,
				execFileSync('git', ['show', process.env.BENCH_REFERENCE + ':src/lib/' + file], {
					cwd: root,
					encoding: 'utf8'
				})
			])
		: []
);
export default {
	...config,
	plugins: [
		{
			name: 'integrated-reference',
			enforce: 'pre',
			load(id) {
				return sources.get(id);
			}
		},
		...config.plugins
	]
};
