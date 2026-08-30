<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { InputBond, InputContext, type InputStateProps } from './bond.svelte';
	import type { InputRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		value,
		checked = undefined,
		files = [],
		preset = undefined,
		as = undefined,
		base = undefined,
		initial = undefined,
		enter = undefined,
		exit = undefined,
		animate = undefined,
		children = undefined,
		factory = undefined,
		...restProps
	}: InputRootProps = $props();

	// Live props: the Bond reads and writes through these accessors, so the HTML-input prop shapes
	// bridge to the bond's domain props where they are used.
	const bondProps: InputStateProps = {
		get id() {
			return ID;
		},
		get value() {
			return value as InputStateProps['value'];
		},
		set value(v) {
			value = v as typeof value;
		},
		get checked() {
			return checked;
		},
		set checked(v) {
			checked = v;
		},
		get files() {
			return files as InputStateProps['files'];
		},
		set files(v) {
			files = [...(v ?? [])];
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = InputContext.share(build ? build(bondProps) : InputBond.create(bondProps));
	export const getBond = () => bond;

	// Dispatches: the root keeps `as`, `base` and transitions.
	const root = Kernel.element(() => ({ ...restProps, class: klass, preset }), {
		preset: 'input',
		class:
			'text-foreground bg-input relative flex h-10 w-auto items-center overflow-hidden rounded-md border',
		state: bond,
		// The Bond's props select preset variants without reaching the DOM.
		variantProps: () => ({ value, checked, files }),
		as: () => as,
		base: () => base,
		motion: () =>
			initial || enter || exit || animate ? { initial, enter, exit, animate } : undefined,
		attrs: () => ({ id: bond.rootId, role: 'group' })
	});
	const leaf = Kernel.render(root);
</script>

{@render leaf(root, children, { input: bond })}
