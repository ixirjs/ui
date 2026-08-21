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
	// Kernel's Card title on a literal leaf, and the extra bare `<button>` does the same for every
	// button-tagged part — `svelte:element` costs two comment anchors and a per-instance
	// `is_void`/`is_raw_text_element`/tag-name-regex check that a literal tag skips entirely, and
	// `button` is one of the most instantiated tags in any application. A button that also declares a
	// transition still falls to the dynamic pair, exactly as `h3` does. HtmlElement shares the
	// transition axis.
	import type { Snippet } from 'svelte';
	import type { ElementMotion } from '$ixirjs/ui/components/element/use-element-motion.svelte';

	// Widened so argless children and arg-taking part bodies fit one parameter, exactly as
	// `Kernel.render`'s own body does.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export type ElementBody = Snippet<[any]> | Snippet<[]>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Motion = ElementMotion<any>;

	/**
	 * Attrs as seen by the four transition branches. Widened from the bare pair's
	 * `Record<string | symbol, unknown>` because an element carrying `{@attach}` requires every
	 * symbol-keyed spread value to be attachment-typed, and this spread legitimately carries both
	 * attachment keys and ordinary attributes. `html-element.svelte` widens for the same reason.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export type MotionAttrs = Record<string, any>;

	/**
	 * Every leaf here, and Kernel's two escalation leaves, share this one signature — so a caller
	 * selects a branch by table lookup and dispatches it dynamically. The callee being dynamic costs
	 * no anchor, where an `{#if}` per mode would cost two on every rendered element.
	 */
	export type ElementBranch = Snippet<[view: ElementView, body?: ElementBody, arg?: unknown]>;

	/**
	 * What a branch needs from whoever is rendering it.
	 *
	 * The operands are pulled off the view rather than passed alongside it: every one of them was
	 * already a method on the handle the caller passes, so spelling them out at the call site
	 * restated the same object four times.
	 *
	 * `spread()` returns ONE ready object with `class` already in it, rather than a class and an
	 * attrs object the branch then merges. The merge was not free: `class={c} {...attrs}` compiles to
	 * `attributes({ class: clsx(c), ...attrs })`, which copies every attribute of every element on
	 * every render — the largest self-time frame in the SSR profile. Every view already builds or
	 * memoizes an object at this point, so folding the class into it costs nothing and the branch
	 * copies nothing.
	 *
	 * `motion` is optional because a `KernelNode` has none — the branches a node ever selects (the
	 * bare three) do not read it.
	 */
	export type ElementView = {
		tag(): string;
		spread(): MotionAttrs;
		motion?(): Motion | undefined;
		/**
		 * The resolved class, for the two `*Plain` leaves below.
		 *
		 * Optional because only the two views that can reach a plain leaf implement it, and both
		 * already had it: `KernelElement.class()` existed for the escalation leaves, and
		 * `KernelNode.class()` used to forward to the element it owns. Neither costs a new closure.
		 */
		class?(): string;
		/** A node's element id. Absent on `KernelElement`, which carries its id inside `attrs`. */
		plainId?(): string | undefined;
		/** DEV-only `data-bond`, declared as a real attribute so the same leaf runs in both modes. */
		plainBond?(): string | undefined;
		/** DEV-only `data-kind`, same reason. */
		plainKind?(): string | undefined;
	};

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
		divPlain,
		headingPlain,
		divBranch,
		headingBranch,
		buttonBranch,
		dynamicBranch,
		divLocal,
		dynamicLocal,
		divGlobal,
		dynamicGlobal
	};
</script>

<!-- ── plain: every attribute this element has, written literally ─────────────────── -->

<!--
	The class-only lane's leaf. A part whose attributes reduce to `class` (plus a node's `id`, plus
	the two DEV markers) does not need the spread pair: `{...view.spread()}` compiles to
	`$.attributes({ ...view.spread() })`, so it allocates the attrs object, copies it a second time
	because the compiler cannot know the source is already fresh, allocates `Object.keys`, and then
	per attribute runs a name regex, a `toLowerCase` and `is_boolean_attribute` — which is a linear
	scan of twenty-six strings. Written literally, all of that is compile-time.

	`data-bond` and `data-kind` are declared here rather than being appended in DEV so that the
	branch CI executes is the branch production executes. That divergence is exactly what kept the
	other half of this lever un-taken last round (`perf-vs-shadcn-2026-08.md` §11, stage 4b); a
	literal attribute whose value is `undefined` emits nothing, so one leaf serves both modes.

	Attribute order matches what `KernelNode.spread()` builds — class, id, data-bond, data-kind —
	because the rendered bytes must not move. An empty class does not reach here: `attr_class`
	drops `class=""` where the spread path emits it, so the caller keeps that case on `divBranch`.
-->

{#snippet divPlain(view: ElementView, body?: ElementBody, arg?: unknown)}
	<div
		class={view.class!()}
		id={view.plainId?.()}
		data-bond={view.plainBond?.()}
		data-kind={view.plainKind?.()}
	>
		{@render body?.(arg)}
	</div>
{/snippet}

{#snippet headingPlain(view: ElementView, body?: ElementBody, arg?: unknown)}
	<h3
		class={view.class!()}
		id={view.plainId?.()}
		data-bond={view.plainBond?.()}
		data-kind={view.plainKind?.()}
	>
		{@render body?.(arg)}
	</h3>
{/snippet}

<!-- ── bare: no transition to drive ─────────────────────────────────────────────────────────── -->

{#snippet divBranch(view: ElementView, body?: ElementBody, arg?: unknown)}
	<div {...view.spread()}>{@render body?.(arg)}</div>
{/snippet}

{#snippet headingBranch(view: ElementView, body?: ElementBody, arg?: unknown)}
	<h3 {...view.spread()}>{@render body?.(arg)}</h3>
{/snippet}

{#snippet buttonBranch(view: ElementView, body?: ElementBody, arg?: unknown)}
	<button {...view.spread()}>{@render body?.(arg)}</button>
{/snippet}

{#snippet dynamicBranch(view: ElementView, body?: ElementBody, arg?: unknown)}
	<svelte:element this={view.tag()} {...view.spread()}>
		{@render body?.(arg)}
	</svelte:element>
{/snippet}

<!-- ── local transitions: default-scoped, do not play on an ancestor's enter/exit ────────────── -->

{#snippet divLocal(view: ElementView, body?: ElementBody, arg?: unknown)}
	{@const motion = view.motion!()!}
	{@const applyInitial = motion.applyInitial}
	{@const attachMotion = motion.attach}
	{@const enter = motion.enterTransition}
	{@const exit = motion.exitTransition}
	{@const props = motionAttrs(view.spread(), motion)}
	<div {@attach applyInitial} {@attach attachMotion} in:enter out:exit {...props}>
		{@render body?.(arg)}
	</div>
{/snippet}

{#snippet dynamicLocal(view: ElementView, body?: ElementBody, arg?: unknown)}
	{@const motion = view.motion!()!}
	{@const applyInitial = motion.applyInitial}
	{@const attachMotion = motion.attach}
	{@const enter = motion.enterTransition}
	{@const exit = motion.exitTransition}
	{@const props = motionAttrs(view.spread(), motion)}
	<svelte:element
		this={view.tag()}
		{@attach applyInitial}
		{@attach attachMotion}
		in:enter
		out:exit
		{...props}
	>
		{@render body?.(arg)}
	</svelte:element>
{/snippet}

<!-- ── global transitions: play when any ancestor block enters or exits ──────────────────────── -->

{#snippet divGlobal(view: ElementView, body?: ElementBody, arg?: unknown)}
	{@const motion = view.motion!()!}
	{@const applyInitial = motion.applyInitial}
	{@const attachMotion = motion.attach}
	{@const enter = motion.enterTransition}
	{@const exit = motion.exitTransition}
	{@const props = motionAttrs(view.spread(), motion)}
	<div {@attach applyInitial} {@attach attachMotion} in:enter|global out:exit|global {...props}>
		{@render body?.(arg)}
	</div>
{/snippet}

{#snippet dynamicGlobal(view: ElementView, body?: ElementBody, arg?: unknown)}
	{@const motion = view.motion!()!}
	{@const applyInitial = motion.applyInitial}
	{@const attachMotion = motion.attach}
	{@const enter = motion.enterTransition}
	{@const exit = motion.exitTransition}
	{@const props = motionAttrs(view.spread(), motion)}
	<svelte:element
		this={view.tag()}
		{@attach applyInitial}
		{@attach attachMotion}
		in:enter|global
		out:exit|global
		{...props}
	>
		{@render body?.(arg)}
	</svelte:element>
{/snippet}
