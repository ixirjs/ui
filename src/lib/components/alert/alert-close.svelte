<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertCloseButtonProps } from './types';
	import { Icon } from '$ixirjs/ui/components/icon';

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertCloseButtonProps<E, B> = $props();

	const part = usePart(AlertBond, 'closeButton', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;

	const defaults = $derived({
		type: as === 'button' ? 'button' : undefined,
		role: as === 'button' ? undefined : 'button',
		tabindex: as === 'button' ? undefined : 0
	});

	const el = usePartElement(part, () => ({
		as,
		defaults,
		class: [
			'alert-close-button border-border flex size-6 items-center justify-center rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10',
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render partElement(el, body)}

{#snippet body()}
	{@render (children ?? fallback)({ alert: bond! })}
{/snippet}

{#snippet fallback()}
	<Icon class="h-full">
		<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	</Icon>
{/snippet}
