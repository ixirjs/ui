<script lang="ts">
	// @ixirjs/ui side of the card parity pair. Rendered idiomatically — no `as`, no forced classes —
	// because the point is what an application actually gets, not a shape contorted into agreement.
	// The skeleton assertion in the runner is what keeps the pair comparable; see `dom.ts`.
	import { Card } from '$ixirjs/ui/components/card';
	import type { FixtureProps } from './props.js';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	// A real app installs the preset, and without one `klass()` answers from the memoised
	// fallback while shadcn runs `cn()` on every element — ~0.8 µs/part the head-to-head was not
	// charging us. perf-vs-shadcn-2026-08.md §17.
	setPreset(defaultPreset);
</script>

{#each { length: n } as _, i (i)}
	<Card.Root class={tint}>
		<Card.Header><Card.Title>Title {i}</Card.Title></Card.Header>
		<Card.Body>Body {i}</Card.Body>
	</Card.Root>
{/each}

<Card.Root class={bump}>
	<Card.Header><Card.Title>Probe</Card.Title></Card.Header>
	<Card.Body>Probe</Card.Body>
</Card.Root>
