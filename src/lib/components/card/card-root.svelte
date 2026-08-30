<script module lang="ts">
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

<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardBond, CardContext } from './bond.svelte';
	import type { CardRootProps } from './types';
	import './card.css';

	const ID = $props.id();
	let {
		disabled = false,
		clickable = undefined,
		factory = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: CardRootProps = $props();

	// Live props: the Bond reads through these getters, so a prop change is seen where it is read.
	const bondProps = {
		get id() {
			return ID;
		},
		get disabled() {
			return disabled;
		},
		get clickable() {
			return clickable ?? Boolean(onclick);
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const card = CardContext.share(build ? build(bondProps) : CardBond.create(bondProps));
	export const getBond = () => card;

	const interactive = () => !disabled && Boolean(onclick || onkeydown || clickable);
	const keydown = (event: KeyboardEvent) => handleCardKeydown(event, onclick, onkeydown);

	const el = Kernel.element(() => restProps, {
		preset: 'card',
		class: 'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm',
		state: card,
		attrs: () => {
			const attrs: Record<string, unknown> = { id: card.rootId };
			if (card.isClickable) {
				attrs.role = 'button';
				if (!disabled) attrs.tabindex = 0;
			}
			if (disabled) {
				attrs['aria-disabled'] = true;
				attrs.class = 'opacity-50 cursor-not-allowed';
			}
			if (card.titleId) attrs['aria-labelledby'] = card.titleId;
			if (card.descriptionId) attrs['aria-describedby'] = card.descriptionId;
			if (interactive()) {
				attrs.onclick = onclick;
				attrs.onkeydown = keydown;
			}
			return attrs;
		}
	});
</script>

<div {...el.attrs}>{@render children?.({ card })}</div>
