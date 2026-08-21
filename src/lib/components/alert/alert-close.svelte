<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { AlertBond } from './bond.svelte';
	const PART = Kernel.plan(AlertBond, 'closeButton', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'button', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { AlertCloseButtonProps } from './types';
	import { Icon } from '$ixirjs/ui/components/icon';

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertCloseButtonProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'optional' });
	const bond = part.bond;

	const defaults = $derived({
		type: as === 'button' ? 'button' : undefined,
		role: as === 'button' ? undefined : 'button',
		tabindex: as === 'button' ? undefined : 0
	});

	const el = Kernel.element(part, () => ({
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

{@render Kernel.render(el)(el, body)}

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
