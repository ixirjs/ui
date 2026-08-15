<script module lang="ts">
	// Module scope, not a prop: a plain object handed through `$props()` is proxied into `$state`, and
	// incrementing it inside the tracked evaluation then trips `state_unsafe_mutation`. The spec
	// resets it per test.
	export const counter = { bare: 0, withAttrs: 0 };
</script>

<script lang="ts">
	import { setPreset } from '$ixirjs/ui/preset';
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';

	// A preset given as a factory is invoked once per presentation resolve (`resolvers.resolveEntry`),
	// so counting its calls counts snapshot recomputes exactly — no timing, no machine dependence.
	//
	// Two parts, because the fold has two shapes with different reactive behaviour:
	//  - `button` declares class only, so `foldPresentationAttrs` hits its passthrough and hands back
	//    the live rest-props proxy by reference.
	//  - `badge` declares `attrs`, so the fold must copy key by key inside the tracked boundary.
	let title = $state('a');
	let hidden = $state(false);

	setPreset({
		button: () => {
			counter.bare++;
			return { class: 'counted-bare' };
		},
		badge: () => {
			counter.withAttrs++;
			return { class: 'counted-attrs', attrs: { 'data-preset': 'badge' } };
		}
	});
</script>

<button data-testid="flip-title" onclick={() => (title = title === 'a' ? 'b' : 'a')}>title</button>
<button data-testid="flip-hidden" onclick={() => (hidden = !hidden)}>hidden</button>

<KernelElement data-testid="bare" as="div" preset="button" {title} aria-hidden={hidden}
></KernelElement>
<KernelElement data-testid="with-attrs" as="div" preset="badge" {title} aria-hidden={hidden}
></KernelElement>
