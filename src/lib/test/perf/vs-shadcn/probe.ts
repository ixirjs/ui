// Scratch probe: dump one render per fixture so the pair's DOM can be eyeballed and matched.
// Not part of `bench:vs-shadcn`; kept because "what does the other side actually emit" is the first
// question every new family raises.
import { render } from 'svelte/server';
import { FAMILIES } from './families.js';

const only = process.argv[2];
for (const family of FAMILIES) {
	if (only && family.name !== only) continue;
	for (const side of ['ixir', 'shadcn'] as const) {
		const body = render(family[side], { props: { n: 2 } }).body;
		console.log(`\n=== ${family.name} / ${side} (${body.length} B) ===`);
		console.log(body);
	}
}
