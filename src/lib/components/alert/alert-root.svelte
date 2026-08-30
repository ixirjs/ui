<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AlertBond, AlertContext } from './bond.svelte';
	import type { AlertRootProps } from './types';
	import './alert.css';

	const ID = $props.id();

	let {
		as = undefined,
		base = undefined,
		disabled = false,
		extend = {},
		factory = undefined,
		children = undefined,
		...restProps
	}: AlertRootProps = $props();

	// Live props: the Bond reads through these getters, so a prop change is seen where it is read.
	const bondProps = {
		get id() {
			return ID;
		},
		get disabled() {
			return disabled;
		},
		get extend() {
			return extend;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const alert = AlertContext.share(build ? build(bondProps) : AlertBond.create(bondProps));
	export const getBond = () => alert;

	const el = Kernel.element(() => restProps, {
		preset: 'alert',
		class:
			'alert border-border relative flex gap-1 rounded-md border p-4 transition-all duration-200',
		state: alert,
		// Dispatches: `as`/`base` and the lifecycle/transition props are part of this root's
		// contract (a live region a consumer may retag or animate), unlike `Card.Root`.
		as: () => as,
		base: () => base,
		variantProps: () => ({ disabled }),
		// `role="alert"` already implies assertive + atomic, so no `aria-live`/`aria-atomic` beside it.
		attrs: () => ({
			class: ['bg-background text-foreground', disabled && 'pointer-events-none opacity-50'],
			id: alert.rootId,
			'aria-disabled': disabled ? 'true' : 'false',
			role: 'alert'
		})
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { alert })}
