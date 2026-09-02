<script module lang="ts">
	// Installed once at module scope — the recommended app setup — rather than per-render
	// `setPreset`. See preset/context.svelte.ts `installPreset`.
	import { defaultPreset, installPreset } from '$ixirjs/ui/preset';

	installPreset(defaultPreset);
</script>

<script lang="ts">
	// @ixirjs/ui side of the card parity pair. Rendered idiomatically — no `as`, no forced classes —
	// because the point is what an application actually gets, not a shape contorted into agreement.
	// The skeleton assertion in the runner is what keeps the pair comparable; see `dom.ts`.
	import { Card } from '$ixirjs/ui/components/card';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
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
