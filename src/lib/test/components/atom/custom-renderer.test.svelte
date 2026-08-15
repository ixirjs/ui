<script lang="ts">
	// A consumer-supplied renderer: it resolves nothing itself and simply spreads what it is given,
	// which is exactly how an HtmlElement-private prop would reach the DOM.
	import { untrack } from 'svelte';

	let {
		received = undefined,
		children = undefined,
		class: klass = '',
		as: _as = 'div',
		...restProps
	}: {
		received?: string[];
		children?: import('svelte').Snippet;
		class?: string;
		as?: string;
	} & Record<string, unknown> = $props();

	// Init-time capture is the point: record what the renderer slot handed over on first render.
	untrack(() => received?.push(...Object.keys(restProps)));

	// …and publish the same list to the DOM, because `received` does not survive the trip. An
	// array-valued attribute is COPIED on its way through the resolve pipeline, so the renderer
	// pushes into a different array than the spec is holding and the spec's stays empty — which made
	// every assertion against it pass vacuously, including the one guarding `__presentationResolved`.
	// The attribute crosses the boundary the array cannot.
	const receivedKeys = $derived(Object.keys(restProps).join(','));
</script>

<div class={klass} {...restProps} data-received={receivedKeys}>{@render children?.()}</div>
