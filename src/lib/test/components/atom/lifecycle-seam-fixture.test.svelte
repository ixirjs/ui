<script lang="ts">
	// One fixture covers Kernel's leaf and custom-renderer branches. Lifecycle stays owned by
	// Kernel.element in both modes and must fire exactly once.
	import { Card } from '$ixirjs/ui/components/card';
	import type { ComponentBase } from '$ixirjs/ui/components/atom';

	let {
		lifecycleProps = {},
		base = undefined,
		...rest
	}: {
		lifecycleProps?: Record<PropertyKey, unknown>;
		base?: ComponentBase | undefined;
		[key: string]: unknown;
	} = $props();
</script>

<Card.Root data-testid="seam-lifecycle" {...rest} {...lifecycleProps} {...base ? { base } : {}}>
	hello-seam
</Card.Root>
