<script lang="ts">
	// shadcn-svelte side: the vendored source verbatim (`bench/vs-shadcn/shadcn`). This family has no
	// abstraction layer at all — a `<div>`, a `cn()` call, `{...restProps}` — so it is the hardest
	// parity fight in the set and the one worth losing honestly.
	import * as Card from '$shadcn/shadcn/card/index.js';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

{#each { length: n } as _, i (i)}
	<Card.Root class={tint}>
		<Card.Header><Card.Title>Title {i}</Card.Title></Card.Header>
		<Card.Content>Body {i}</Card.Content>
	</Card.Root>
{/each}

<Card.Root class={bump}>
	<Card.Header><Card.Title>Probe</Card.Title></Card.Header>
	<Card.Content>Probe</Card.Content>
</Card.Root>
