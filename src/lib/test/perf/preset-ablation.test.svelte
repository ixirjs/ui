<script lang="ts">
	// RC4 attribution fixture: the same card compound as ablation.test.svelte's `card` layer, but
	// with `defaultPreset` installed the way the comparison app installs it (see
	// ixirjs/compare `apps/ixir/src/routes/+layout.svelte`). The delta against the bare `card`
	// layer is the per-card cost of resolving an installed preset — the configuration every real
	// application pays and the bare ladder does not.
	import { Card } from '$ixirjs/ui/components/card';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100 }: { n?: number } = $props();

	setPreset(defaultPreset);
</script>

{#each { length: n } as _, i (i)}
	<Card.Root>
		<Card.Header><Card.Title>Title {i}</Card.Title></Card.Header>
		<Card.Body>Body {i}</Card.Body>
	</Card.Root>
{/each}
