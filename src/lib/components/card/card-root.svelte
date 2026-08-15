<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CardBond } from './bond.svelte';
	const PLAN = Kernel.root(CardBond, 'root', {
		class: 'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm'
	});

	function handleCardKeydown(
		event: KeyboardEvent,
		onclick: ((event: MouseEvent) => void) | undefined,
		onkeydown: ((event: KeyboardEvent) => void) | undefined
	): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick?.(event as unknown as MouseEvent);
		}
		onkeydown?.(event);
	}
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { BROWSER } from 'esm-env';
	import { onDestroy } from 'svelte';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { CardBondProps } from './bond.svelte';
	import type { CardRootProps } from './types';
	import './card.css';

	const ID = $props.id();
	let {
		class: klass = '',
		preset = undefined,
		disabled = false,
		clickable = undefined,
		factory = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		as = undefined,
		part = undefined,
		...restProps
	}: CardRootProps<E, B> = $props();

	const state: CardBondProps = {
		get disabled() {
			return disabled;
		},
		set disabled(value) {
			disabled = value ?? false;
		},
		get clickable() {
			return clickable ?? Boolean(onclick);
		},
		set clickable(value) {
			clickable = value;
		}
	};
	Object.defineProperty(state, 'id', { get: () => ID, enumerable: false });
	// Bond identity is fixed for the component lifetime; later factory prop changes never replaced it.
	// svelte-ignore state_referenced_locally
	const initialFactory = factory;
	const bond = initialFactory ? initialFactory(state) : CardBond.create(state);
	bond.activateCapabilities(bond);
	bond.share();
	if (BROWSER || bond.hasCapabilityTeardown) onDestroy(() => bond.destroy());

	const source: Record<string, unknown> = {
		get class() {
			return klass;
		},
		get preset() {
			return preset;
		},
		get as() {
			return as;
		},
		get part() {
			return part;
		},
		get onclick() {
			return disabled ? undefined : onclick;
		},
		get onkeydown() {
			return !disabled && (onclick || onkeydown || clickable)
				? (event: KeyboardEvent) => handleCardKeydown(event, onclick, onkeydown)
				: undefined;
		}
	};
	const node = Kernel.node(PLAN, () => source, {
		bond,
		rest: () => restProps,
		beforePreset: () => (disabled ? 'opacity-50 cursor-not-allowed' : ''),
		attrs: () => ({
			role: state.clickable ? 'button' : undefined,
			tabindex: state.clickable && !disabled ? 0 : undefined,
			'aria-disabled': disabled,
			'aria-labelledby': BROWSER ? bond.nodeIdByRole('label') : undefined,
			'aria-describedby': BROWSER ? bond.nodeIdByRole('description') : undefined,
			onclick: disabled ? undefined : onclick,
			onkeydown:
				!disabled && (onclick || onkeydown || clickable)
					? (event: KeyboardEvent) => handleCardKeydown(event, onclick, onkeydown)
					: undefined
		})
	});

	export const getBond = () => bond;
</script>

{@render Kernel.render(node)(
	node.tag(),
	node.class(),
	node.attrs(),
	children,
	{ card: bond },
	undefined,
	node
)}
