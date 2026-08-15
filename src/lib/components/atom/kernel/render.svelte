<script module lang="ts">
	import type { Snippet } from 'svelte';
	import RichPart from './rich-part.svelte';
	import type { KernelNode } from './index.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Body = Snippet<[any]> | Snippet<[]>;

	export { richBranch };
</script>

{#snippet richBranch(
	_tag: string,
	_class: string,
	_attrs: Record<string | symbol, unknown>,
	body?: Body,
	bodyArg?: unknown,
	_motion?: unknown,
	node?: KernelNode
)}
	<RichPart node={node!} {...body ? { body } : {}} {...bodyArg !== undefined ? { bodyArg } : {}} />
{/snippet}
