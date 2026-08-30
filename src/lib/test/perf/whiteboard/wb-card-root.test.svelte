<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext, WbCard } from './wb-card.svelte';

	const ID = $props.id();
	let {
		disabled = false,
		clickable = undefined,
		onclick = undefined,
		onkeydown = undefined,
		children = undefined,
		...rest
	}: {
		class?: string;
		disabled?: boolean;
		clickable?: boolean;
		onclick?: (event: MouseEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		children?: Snippet<[{ card: WbCard }]>;
		[key: string]: unknown;
	} = $props();

	const card = CardContext.share(
		new WbCard(
			ID,
			() => disabled,
			() => clickable ?? Boolean(onclick)
		)
	);
	const interactive = () => !disabled && Boolean(onclick || onkeydown || clickable);
	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick?.(event as unknown as MouseEvent);
		}
		onkeydown?.(event);
	}

	const el = Kernel.element(() => rest, {
		preset: 'card',
		class: 'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm',
		state: card,
		attrs: () => {
			const attrs: Record<string, unknown> = { id: Kernel.id(ID, 'card-root') };
			if (card.isClickable) {
				attrs.role = 'button';
				if (!disabled) attrs.tabindex = 0;
			}
			if (disabled) attrs['aria-disabled'] = true;
			if (card.titleId) attrs['aria-labelledby'] = card.titleId;
			if (interactive()) {
				attrs.onclick = onclick;
				attrs.onkeydown = keydown;
			}
			return attrs;
		}
	});
</script>

<div {...el.attrs}>{@render children?.({ card })}</div>
