<script lang="ts">
	import { Icon } from '$ixirjs/ui/components/icon';
	import Close from '$ixirjs/ui/icons/icon-close.svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { shouldSkipPolicy } from '$ixirjs/ui/capability/models/interaction-policies/shared';
	import { ToastContext } from './bond.svelte';
	import type { ToastCloseProps } from './types';

	let {
		as = 'button',
		base = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: ToastCloseProps = $props();
	const bond = ToastContext.getOrThrow('<Toast.Close /> must be used within a <Toast.Root />');

	// The close policy: a consumer handler runs first and cancels by preventing default; the part
	// then stages the reason, skips secondary buttons, repeats and a non-dismissible toast, stops
	// propagation and closes.
	const undismissible = () => bond.props.dismissible === false;
	function dismiss(event: Event) {
		bond.stageOpenChange({ event, reason: 'close-button' });
		if (shouldSkipPolicy(undismissible, bond as never, event)) return;
		event.stopPropagation();
		bond.close();
	}
	function onclick_(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		dismiss(event);
	}
	function onkeydown_(event: KeyboardEvent) {
		onkeydown?.(event);
		if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		dismiss(event);
	}

	const el = Kernel.element(() => restProps, {
		preset: 'toast.close',
		class: 'cursor-pointer text-current h-6',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const attrs: Record<string, unknown> = {
				type: as === 'button' ? 'button' : undefined,
				role: as === 'button' ? undefined : 'button',
				tabindex: as === 'button' ? undefined : 0,
				id: bond.closeId,
				'aria-label': 'Dismiss notification',
				onclick: onclick_,
				onkeydown: onkeydown_
			};
			if (undismissible()) {
				attrs.disabled = true;
				attrs['aria-disabled'] = 'true';
				attrs.tabindex = -1;
			}
			return attrs;
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, body)}

{#snippet body()}
	{@render (children ?? fallback)({ toast: bond })}
{/snippet}

{#snippet fallback()}
	<Icon class="h-full" src={Close} />
{/snippet}
