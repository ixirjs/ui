<script module lang="ts">
	import RichPart from './rich-part.svelte';
	import type { ElementBody } from '../render/element-branches.svelte';
	import type { KernelNode } from './index.svelte';

	export { richBranch };
</script>

{#snippet richBranch(node: KernelNode, body?: ElementBody, arg?: unknown)}
	<RichPart {node} {...body ? { body } : {}} {...arg !== undefined ? { bodyArg: arg } : {}} />
{/snippet}
