<script lang="ts">
	// `bindBond` registers an onDestroy, so it can only be called during component initialisation.
	// This harness gives a spec that component context without prescribing what it binds: the test
	// supplies the call and keeps the resulting binding for assertions after render.
	let { run }: { run: () => void } = $props();

	// One-shot init call. Reading the prop once at initialisation is the point of the harness — it
	// is never meant to re-run when the parent passes a different callback.
	// svelte-ignore state_referenced_locally
	run();
</script>

<div data-testid="bind-harness"></div>
