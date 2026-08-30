<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { ToastBond, ToastContext } from './bond.svelte';
	import type { ToastRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(true),
		as = undefined,
		base = undefined,
		disabled = false,
		duration = 0,
		dismissible = true,
		factory = undefined,
		children = undefined,
		onopenchange = undefined,
		...restProps
	}: ToastRootProps = $props();

	// Live props; the `open` setter is the commit: the callback fires after the write with the
	// staged reason, never for an equal value.
	const bondProps = {
		get id() {
			return ID;
		},
		get open() {
			return open;
		},
		set open(next: boolean) {
			const changed = next !== open;
			open = next;
			if (changed) onopenchange?.(next, { bond, ...bond.takeOpenChangeContext() });
		},
		get disabled() {
			return disabled;
		},
		get dismissible() {
			return dismissible;
		},
		get duration() {
			return duration;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = ToastContext.share(build ? build(bondProps) : ToastBond.create(bondProps));
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'toast',
		// No base classes of its own — the preset owns this element's appearance entirely.
		class: '',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const isOpen = bond.props.open ?? false;
			const attrs: Record<string, unknown> = {
				id: bond.rootId,
				'aria-disabled': bond.props.disabled ? 'true' : 'false',
				'data-open': isOpen,
				'data-state': isOpen ? 'open' : 'closed',
				role: 'status',
				'aria-live': 'polite',
				'aria-atomic': 'true'
			};
			if (bond.titleId) attrs['aria-labelledby'] = bond.titleId;
			if (bond.descriptionId) attrs['aria-describedby'] = bond.descriptionId;
			return attrs;
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { toast: bond })}
