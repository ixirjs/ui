<script lang="ts">
	// The SHIPPED Card, imported part by part instead of through the `Card` namespace.
	//
	// This arm exists to price one thing: `<Card.Root>` is a member expression, so the compiler
	// treats it as a DYNAMIC component and wraps its output in a fragment boundary. Both this file
	// and `ixir-card.test.svelte` render the same components with the same props; the only
	// difference is the call site. The delta is what the barrel costs.
	//
	// It replaced `ixir-card-wb`, which compared the shipped family against a design-phase
	// prototype — a comparison that stopped meaning anything when the shipped family moved onto the
	// same architecture (2026-08-27).
	import CardRoot from '$ixirjs/ui/components/card/card-root.svelte';
	import CardHeader from '$ixirjs/ui/components/card/card-header.svelte';
	import CardTitle from '$ixirjs/ui/components/card/card-title.svelte';
	import CardBody from '$ixirjs/ui/components/card/card-body.svelte';
	import type { FixtureProps } from './props.js';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	setPreset(defaultPreset);
</script>

{#each { length: n } as _, i (i)}
	<CardRoot class={tint}>
		<CardHeader><CardTitle>Title {i}</CardTitle></CardHeader>
		<CardBody>Body {i}</CardBody>
	</CardRoot>
{/each}

<CardRoot class={bump}>
	<CardHeader><CardTitle>Probe</CardTitle></CardHeader>
	<CardBody>Probe</CardBody>
</CardRoot>
