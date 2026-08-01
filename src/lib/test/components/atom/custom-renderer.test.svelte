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
</script>

<div class={klass} {...restProps}>{@render children?.()}</div>
