<script lang="ts">
	import { Icon } from '$ixirjs/ui/components/icon';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AlertContext } from './bond.svelte';
	import type { AlertCloseButtonProps } from './types';

	let {
		as = 'button',
		base = undefined,
		children = undefined,
		...restProps
	}: AlertCloseButtonProps = $props();
	const alert = AlertContext.getOptional();

	const el = Kernel.element(() => restProps, {
		preset: 'alert.close',
		class:
			'alert-close-button border-border flex size-6 items-center justify-center rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10',
		state: alert,
		as: () => as,
		base: () => base,
		attrs: () => {
			const isButton = as === 'button';
			return {
				type: isButton ? 'button' : undefined,
				role: isButton ? undefined : 'button',
				tabindex: isButton ? undefined : 0,
				...(alert ? { id: alert.closeId } : {}),
				'aria-label': 'Dismiss alert'
			};
		}
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, body)}

{#snippet body()}
	{@render (children ?? fallback)({ alert: alert! })}
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
