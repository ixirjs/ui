<script lang="ts">
	import type { ActivePortalProps } from './types';
	import { PortalsBond, resolvePortal } from './portals';

	let { portal, children }: ActivePortalProps = $props();

	const portalsBond = PortalsBond.get();

	const activePortal = $derived(resolvePortal(portalsBond, portal));

	// Warn (in an effect, after registration settles) when a string id never resolves.
	$effect(() => {
		if (import.meta.env?.DEV && typeof portal === 'string' && !activePortal) {
			console.warn(
				`[svelte-atoms] <ActivePortal portal="${portal}">: no portal registered with this id; rendering nothing.`
			);
		}
	});

	// Snippet-or-undefined: shares the portal into context from inside the rendered block, so local
	// enter/exit transitions still play.
	const content = $derived(activePortal ? proxy : undefined);

	function proxy(...args: unknown[]) {
		activePortal?.share();
		return children?.(...args);
	}
</script>

{@render content?.()}
