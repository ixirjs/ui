<script module lang="ts">
	// Every native element branch in the library. This module stays component-free so Kernel and
	// HtmlElement can share it without a cycle.
	//
	// **Why separate snippets and not one parameterised snippet.** Three pieces of Svelte syntax are
	// inline-only and cannot be passed, computed, or forwarded:
	//   - `<svelte:element this={'div'}>` compiles to the same dynamic `element()` call as a runtime
	//     tag, so a literal `<div>` is the only way to reach the static path — 1 anchor, not 3.
	//   - `in:` / `out:` cannot take a "global or not" flag; the modifier is compile-time.
	//   - `{@attach}` cannot be conditional.
	// So {div, dynamic} × {bare, local, global} has to be enumerated. The extra bare `<h3>` keeps
	// Kernel's Card title on a literal leaf. HtmlElement shares the transition axis.
	import type { Snippet } from 'svelte';
	import type { ElementMotion } from '$ixirjs/ui/components/element/use-element-motion.svelte';

	// Widened so argless children and arg-taking part bodies fit one parameter, exactly as
	// `Kernel.render`'s own body does.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type ElementBody = Snippet<[any]> | Snippet<[]>;

	// One signature for every branch so the caller's dispatch stays a single ternary chain — the
	// callee is already dynamic, so choosing a branch costs no anchor, where an `{#if}` would cost
	// two on every rendered element. `motion` is unused by the bare pair and required by the other
	// four; it rides last so the common call site never mentions it.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Motion = ElementMotion<any>;

	/**
	 * Attrs as seen by the four transition branches. Widened from the bare pair's
	 * `Record<string | symbol, unknown>` because an element carrying `{@attach}` requires every
	 * symbol-keyed spread value to be attachment-typed, and this spread legitimately carries both
	 * attachment keys and ordinary attributes. `html-element.svelte` widens for the same reason.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type MotionAttrs = Record<string, any>;

	/**
	 * Props that must never reach the DOM, and the transition handlers that must.
	 *
	 * `html-element.svelte` destructures these five out of its rest props, so they never landed on an
	 * element. The leaves spread their attrs verbatim, so without this they do: `global` is not a
	 * boolean DOM attribute, so SSR emits `global="true"`, and `onmount`/`ondestroy`/`onexitend`
	 * become listeners for events Svelte never dispatches.
	 *
	 * `decorate` is the other half and is not optional. It maps the library's `onexitend` onto
	 * Svelte's real `onoutroend`, and wires `handleIntroEnd` — the ONLY thing that ever flips the
	 * rune's `hasEntered`, which in turn gates `animate`. Omit it and `animate` is permanently dead
	 * behind any `enter`, silently.
	 *
	 * `decorate` mutates and returns its argument, so it is handed a fresh object rather than the
	 * caller's resolved attrs.
	 */
	const RENDERER_ONLY = ['global', 'onmount', 'ondestroy', 'onintroend', 'onexitend'] as const;

	function motionAttrs(attrs: MotionAttrs, motion: Motion): MotionAttrs {
		const out: MotionAttrs = { ...attrs };
		for (const key of RENDERER_ONLY) delete out[key];
		return motion.decorate(out);
	}

	export {
		divBranch,
		headingBranch,
		dynamicBranch,
		divLocal,
		dynamicLocal,
		divGlobal,
		dynamicGlobal
	};
</script>

<!-- ── bare: no transition to drive ─────────────────────────────────────────────────────────── -->

{#snippet divBranch(
	_tag: string,
	klass: string,
	attrs: Record<string | symbol, unknown>,
	body?: ElementBody,
	bodyArg?: unknown,
	_motion?: Motion,
	_el?: unknown
)}
	<div class={klass} {...attrs}>{@render body?.(bodyArg)}</div>
{/snippet}

{#snippet headingBranch(
	_tag: string,
	klass: string,
	attrs: Record<string | symbol, unknown>,
	body?: ElementBody,
	bodyArg?: unknown,
	_motion?: Motion,
	_el?: unknown
)}
	<h3 class={klass} {...attrs}>{@render body?.(bodyArg)}</h3>
{/snippet}

{#snippet dynamicBranch(
	tag: string,
	klass: string,
	attrs: Record<string | symbol, unknown>,
	body?: ElementBody,
	bodyArg?: unknown,
	_motion?: Motion,
	_el?: unknown
)}
	<svelte:element this={tag} class={klass} {...attrs}>{@render body?.(bodyArg)}</svelte:element>
{/snippet}

<!-- ── local transitions: default-scoped, do not play on an ancestor's enter/exit ────────────── -->

{#snippet divLocal(
	_tag: string,
	klass: string,
	attrs: MotionAttrs,
	body?: ElementBody,
	bodyArg?: unknown,
	motion?: Motion,
	_el?: unknown
)}
	{@const applyInitial = motion!.applyInitial}
	{@const attachMotion = motion!.attach}
	{@const enter = motion!.enterTransition}
	{@const exit = motion!.exitTransition}
	{@const props = motionAttrs(attrs, motion!)}
	<div {@attach applyInitial} {@attach attachMotion} class={klass} in:enter out:exit {...props}>
		{@render body?.(bodyArg)}
	</div>
{/snippet}

{#snippet dynamicLocal(
	tag: string,
	klass: string,
	attrs: MotionAttrs,
	body?: ElementBody,
	bodyArg?: unknown,
	motion?: Motion,
	_el?: unknown
)}
	{@const applyInitial = motion!.applyInitial}
	{@const attachMotion = motion!.attach}
	{@const enter = motion!.enterTransition}
	{@const exit = motion!.exitTransition}
	{@const props = motionAttrs(attrs, motion!)}
	<svelte:element
		this={tag}
		{@attach applyInitial}
		{@attach attachMotion}
		class={klass}
		in:enter
		out:exit
		{...props}
	>
		{@render body?.(bodyArg)}
	</svelte:element>
{/snippet}

<!-- ── global transitions: play when any ancestor block enters or exits ──────────────────────── -->

{#snippet divGlobal(
	_tag: string,
	klass: string,
	attrs: MotionAttrs,
	body?: ElementBody,
	bodyArg?: unknown,
	motion?: Motion,
	_el?: unknown
)}
	{@const applyInitial = motion!.applyInitial}
	{@const attachMotion = motion!.attach}
	{@const enter = motion!.enterTransition}
	{@const exit = motion!.exitTransition}
	{@const props = motionAttrs(attrs, motion!)}
	<div
		{@attach applyInitial}
		{@attach attachMotion}
		class={klass}
		in:enter|global
		out:exit|global
		{...props}
	>
		{@render body?.(bodyArg)}
	</div>
{/snippet}

{#snippet dynamicGlobal(
	tag: string,
	klass: string,
	attrs: MotionAttrs,
	body?: ElementBody,
	bodyArg?: unknown,
	motion?: Motion,
	_el?: unknown
)}
	{@const applyInitial = motion!.applyInitial}
	{@const attachMotion = motion!.attach}
	{@const enter = motion!.enterTransition}
	{@const exit = motion!.exitTransition}
	{@const props = motionAttrs(attrs, motion!)}
	<svelte:element
		this={tag}
		{@attach applyInitial}
		{@attach attachMotion}
		class={klass}
		in:enter|global
		out:exit|global
		{...props}
	>
		{@render body?.(bodyArg)}
	</svelte:element>
{/snippet}
