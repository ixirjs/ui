<script lang="ts">
	import { untrack } from 'svelte';
	import { usePart } from '$ixirjs/ui/public/shared';
	import { ProbeBond, VowelProbeBond } from './use-part-probe.test.svelte';

	// Rendered with no root in context, so `usePart` throws during initialisation. That is the only
	// way to observe the derived message: `usePart` reads context and cannot run outside a component.
	let { vowel = false, message = undefined }: { vowel?: boolean; message?: string } = $props();

	const isVowel = untrack(() => vowel);
	const explicit = untrack(() => message);

	if (isVowel) usePart(VowelProbeBond, 'header', {});
	else if (explicit) usePart(ProbeBond, 'trigger', {}, { message: explicit });
	else usePart(ProbeBond, 'trigger', {});
</script>

<div data-testid="never-rendered"></div>
