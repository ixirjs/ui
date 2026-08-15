import { untrack } from 'svelte';
import type { MotionTransitionFunction, ResolvedMotion } from '$ixirjs/ui/preset';
import { stopMotion } from './motion-host';

/**
 * The motion half of an element renderer — the transition snapshot, three effects, the intro/exit
 * handlers and the four attachments, which `html-element.svelte` and `svg-element.svelte` carried
 * identically. What differs between them is presentation and namespace, and namespace can't move
 * into a shared *component* at all: `<svelte:options namespace>` is compile-time.
 *
 * Everything arrives as a thunk because these are props; capturing them at init would freeze the
 * first value.
 */
export interface ElementMotionOptions<E extends Element> {
	/** The already-resolved motion layer. Each renderer folds its own layers before this. */
	motion: () => ResolvedMotion<E> | undefined;
	onmount: () => ((node: E) => void | ((node: E) => void)) | undefined;
	ondestroy: () => ((node: E) => void) | undefined;
	onintroend: () => ((event: TransitionEvent) => void) | undefined;
	onexitend: () => ((event: TransitionEvent) => void) | undefined;
	/**
	 * Run `initial` only on the first element this component ever attaches.
	 *
	 * An option, not a decision: the renderers disagree (HTML passed `true`, SVG had no guard) and
	 * each keeps what it shipped. Observable only when `<svelte:element>` recreates the node — `as`
	 * changes, or a transition switches which snippet renders — where HTML leaves the fresh node
	 * without its initial state and SVG re-applies it. SVG's reading looks better, but changing
	 * HTML's moves rendered output on the hottest path here, so resolve it deliberately with a test.
	 */
	once: boolean;
}

export interface ElementMotion<E extends Element> {
	/** `{@attach}` that captures the node — drives mount/destroy and `animate`. */
	readonly attach: (node: E) => void;
	/** `{@attach}` that runs `initial` exactly once per element. */
	readonly applyInitial: (node: E) => void;
	readonly enterTransition: (node: E) => object;
	readonly exitTransition: (node: E) => object;
	/** False when neither `enter` nor `exit` resolved — the renderer skips the transition wrappers. */
	readonly hasTransitions: boolean;
	/** Adds the transition-end handlers only when transitions exist. */
	readonly decorate: (props: Record<string, unknown>) => Record<string, unknown>;
}

export function useElementMotion<E extends Element>(
	options: ElementMotionOptions<E>
): ElementMotion<E> {
	let node = $state<E>();
	// With an enter transition, `animate` waits until that transition ends.
	let hasEntered = $state<boolean | undefined>();
	// Transition callbacks can run after the component effect is paused for outro, so snapshot the
	// resolved functions outside the reactive graph — teardown must not read an inert derived.
	const transitionMotion: {
		enter: MotionTransitionFunction<E> | undefined;
		exit: MotionTransitionFunction<E> | undefined;
	} = { enter: undefined, exit: undefined };
	// See `once` — component-scoped, which is what makes the two renderers differ.
	let hasInitialized = false;

	const resolvedInitial = $derived(options.motion()?.initial);
	const resolvedEnter = $derived(options.motion()?.enter);
	const resolvedExit = $derived(options.motion()?.exit);
	const resolvedAnimate = $derived(options.motion()?.animate);
	const hasTransitions = $derived(!!(resolvedEnter ?? resolvedExit));

	$effect(() => {
		if (!node) return;

		const unmount = untrack(() => options.onmount()?.(node!));

		return () => {
			if (typeof unmount === 'function') unmount(node!);
			options.ondestroy()?.(node!);
		};
	});

	$effect(() => {
		if (hasEntered !== undefined) return;
		hasEntered = !resolvedEnter;
	});

	$effect(() => {
		if (!hasEntered || !node) return;

		const currentNode = node;
		const cleanup = resolvedAnimate?.(currentNode);
		return () => stopMotion(cleanup, currentNode);
	});

	$effect.pre(() => {
		transitionMotion.enter = resolvedEnter;
		transitionMotion.exit = resolvedExit;
	});

	function handleIntroEnd(event: TransitionEvent) {
		options.onintroend()?.(event);
		if (event.defaultPrevented) return;
		hasEntered = true;
	}

	function handleExitEnd(event: TransitionEvent) {
		options.onexitend()?.(event);
	}

	return {
		attach: (current: E) => {
			node = current;
			// Clearing on teardown is what lets the effects below run their cleanups when the element
			// goes away. Without it `node` stays pointing at a destroyed element forever: `ondestroy`
			// never fires for it and `animate` keeps running against a detached node.
			//
			// This did not bite while `html-element.svelte` was the only caller — a snippet swap there
			// re-fired `attach` with the replacement, so `node` changed and the effects re-ran. The
			// render seam's leaves can swap to a snippet that attaches nothing at all (a transition
			// element becoming a plain one), and then nothing ever reassigns it.
			//
			// The identity guard matters for the swap case: Svelte may run the new element's attach
			// before the old one's cleanup, and clearing unconditionally would drop the live node.
			return () => {
				if (node === current) node = undefined;
			};
		},
		applyInitial(current: E) {
			if (!current) return;
			if (options.once) {
				if (hasInitialized) return;
				hasInitialized = true;
			}
			untrack(() => resolvedInitial?.(current));
		},
		enterTransition: (current: E) => transitionMotion.enter?.(current) ?? {},
		exitTransition: (current: E) => transitionMotion.exit?.(current) ?? {},
		get hasTransitions() {
			return hasTransitions;
		},
		decorate(props: Record<string, unknown>) {
			if (hasTransitions) {
				props.onintroend = handleIntroEnd;
				props.onoutroend = handleExitEnd;
			}
			return props;
		}
	};
}
