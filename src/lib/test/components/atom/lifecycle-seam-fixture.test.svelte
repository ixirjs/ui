<script lang="ts">
	// Through Alert.Root, a root that still dispatches: Card.Root IS its element and takes no
	// `base`/motion (PlainPartProps). One fixture covers Kernel's leaf and custom-renderer branches. Lifecycle stays owned by
	// Kernel.element in both modes and must fire exactly once.
	import { Alert } from '$ixirjs/ui/components/alert';
	import type { ComponentBase } from '$ixirjs/ui/authoring';

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

<Alert.Root data-testid="seam-lifecycle" {...rest} {...lifecycleProps} {...base ? { base } : {}}>
	hello-seam
</Alert.Root>
