<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { ToastBond } from './bond.svelte';
	import type { ToastRootProps } from './types';
	import { bindBond, createAtomInstance } from '$svelte-atoms/core/shared';

	let {
		open = $bindable(true),
		disabled = false,
		duration = 0,
		dismissible: _dismissible,
		preset = undefined,
		factory = (props) => ToastBond.create(props),
		children = undefined,
		// swallowed: kept out of restProps (would attach as a native DOM `close` listener). Not yet wired to the close flow.
		onclose: _onclose = undefined,
		...restProps
	}: ToastRootProps<E, B> = $props();

	let openState = $derived(open);

	const binding = bindBond<ToastBond>(
		(props) => factory(props),
		{
			open: [
				() => openState,
				(v) => {
					openState = v;
					open = openState;
				}
			],
			disabled: () => disabled
		},
		{ preset: () => preset }
	);

	const bond = binding.bond.share();
	const rootAtom = createAtomInstance('root', {
		bond,
		factory: (owner) => owner!.root()
	});

	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	// Auto-dismiss when duration > 0.
	$effect(() => {
		if (!openState || duration <= 0) return;
		const handle = setTimeout(() => {
			bond.close();
		}, duration);
		return () => clearTimeout(handle);
	});

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom {...rootProps}>
	{@render children?.({ toast: bond })}
</HtmlAtom>
