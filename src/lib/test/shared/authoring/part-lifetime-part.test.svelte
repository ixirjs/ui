<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { LifetimeBond } from './part-lifetime-bond.test.svelte';
	const PART = Kernel.part(LifetimeBond, 'trigger', { class: '' });
</script>

<script lang="ts">
	const part = Kernel.node(PART, () => ({}), { context: 'required' });
</script>

<button data-testid="lifetime-trigger" data-atom={part.atom.name}>trigger</button>
