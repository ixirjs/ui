<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { ToastBond, ToastBondState } from './bond.svelte';
	import type { ToastRootProps } from './types';
	import { bondFactory,bindBond } from '$svelte-atoms/core/shared';

	let {
		open = $bindable(true),
		disabled = false,
		duration = 0,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		dismissible: _dismissible,
		preset = undefined,
		factory = bondFactory(ToastBondState, ToastBond),
		children = undefined,
		onclose = undefined,
		...restProps
	}: ToastRootProps<E, B> = $props();

	const binding = bindBond<ToastBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => (open = v)],
			disabled: () => disabled
		},
		{ preset: () => preset }
	);
	
	const bond = binding.bond.share();


	const rootProps = $derived({
		...binding.props,
		...restProps
	});

	// Auto-dismiss when duration > 0.
	$effect(() => {
		if (!open || duration <= 0) return;
		const handle = setTimeout(() => {
			open = false;
		}, duration);
		return () => clearTimeout(handle);
	});

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	{...rootProps}
>
	{@render children?.({ toast: bond })}
</HtmlAtom>
