<script lang="ts">
	import { DEV } from 'esm-env';
	import type { ActivePortalProps } from './types';
	import { PortalsBond, resolvePortal } from './portals';

	let { portal, children }: ActivePortalProps = $props();

	const portalsBond = PortalsBond.get();

	const activePortal = $derived(resolvePortal(portalsBond, portal));

	// Warn (in an effect, after registration settles) when a string id never resolves.
	$effect(() => {
		if (DEV && typeof portal === 'string' && !activePortal) {
			console.warn(
				`[svelte-atoms] <ActivePortal portal="${portal}">: no portal registered with this id; rendering nothing.`
			);
		}
	});

	function proxy(...args: []): ReturnType<NonNullable<typeof children>> | undefined {
		activePortal?.share();
		return children?.(...args);
	}
</script>

<!-- Snippet-or-undefined: shares the portal into context from inside the rendered block, so local
     enter/exit transitions still play. {#snippet} is a proper Snippet type (no casting needed),
     and {void share()} fires it synchronously before children render without emitting DOM text. -->
<!-- {#snippet proxy()}
	{void }
	{@render children?.()}
{/snippet} -->

{@render (activePortal ? proxy : undefined)?.()}
