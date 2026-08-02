<script module lang="ts">
	// The renderer half of the part-element seam (see use-part-element.svelte.ts). A module snippet,
	// deliberately:
	// `{@render partElement(...)}` is a function call into the caller's renderer — no component
	// boundary, no props proxy, no context scope. Parts whose children take arguments
	// (`children?.({ card: bond })`) pass `children` plus the argument as `bodyArg` — a local
	// wrapper snippet would cost one more dynamic-callee render, which is one more hydration
	// anchor per rendered part (see docs/research/hydration-anchor-diet-2026-08.md). Parts with
	// plain children pass `children` alone.
	import type { Snippet } from 'svelte';
	import HtmlAtom from './html-atom.svelte';
	import type { PartElement } from './use-part-element.svelte';

	// Widened so both argless children (`Snippet<[]>`) and arg-taking children fit one parameter;
	// the call site's own children type still checks the argument it declares.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type PartBody = Snippet<[any]> | Snippet<[]>;

	// Both halves of the seam live behind one import, so a part takes one line rather than two.
	export { usePartElement } from './use-part-element.svelte';
	export { partElement };
</script>

{#snippet partElement(el: PartElement, body?: PartBody, bodyArg?: unknown)}
	{@render (el.native() ? (el.tag() === 'div' ? nativeDiv : native) : component)(el, body, bodyArg)}
{/snippet}

<!-- The literal-div fast path. `<svelte:element>` costs three hydration-anchor comments per
     element (before-tag, inner-close, after-tag — see `element()` in svelte's server internals);
     a static tag costs none, and `div` is what nearly every part renders. The branch lives inside
     the ternary above, whose dynamic callee is already paid for, so selection itself adds no
     anchor. Both passes pick the branch from the same resolved tag, so hydration walks exactly
     the structure the server emitted. See docs/research/hydration-anchor-diet-2026-08.md. -->
{#snippet nativeDiv(el: PartElement, body?: PartBody, bodyArg?: unknown)}
	<div class={el.class()} {...el.attrs()}>
		{@render body?.(bodyArg)}
	</div>
{/snippet}

{#snippet native(el: PartElement, body?: PartBody, bodyArg?: unknown)}
	<svelte:element this={el.tag()} class={el.class()} {...el.attrs()}>
		{@render body?.(bodyArg)}
	</svelte:element>
{/snippet}

{#snippet component(el: PartElement, body?: PartBody, bodyArg?: unknown)}
	<HtmlAtom {...el.richProps()}>
		{@render body?.(bodyArg)}
	</HtmlAtom>
{/snippet}
