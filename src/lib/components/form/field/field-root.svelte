<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { onDestroy } from 'svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { FieldBond } from './bond.svelte';
	import type { FieldRootProps } from '$ixirjs/ui/components/form/types';

	const ID = $props.id();

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		name = undefined,
		disabled = false,
		readonly = false,
		required = false,
		schema = undefined,
		mode = undefined,
		extend = {},
		factory = undefined,
		children = undefined,
		...restProps
	}: FieldRootProps<E, B> = $props();

	let valueState = $derived(value);

	const root = useRoot(
		FieldBond,
		{
			name: [() => name, (v) => (name = v)],
			value: [
				() => valueState,
				(v) => {
					valueState = v;
					value = valueState;
				}
			],
			type: () => typeof valueState,
			disabled: () => disabled,
			readonly: () => readonly,
			required: () => required,
			schema: () => schema,
			mode: () => mode,
			extend: () => extend
		},
		{ preset: () => preset, id: () => ID, factory: () => factory }
	);
	const bond = root.bond;

	// `bond.form` is the same context lookup the Bond already did in its constructor.
	const unmount = bond.form?.mountField(bond.id, bond) ?? (() => {});
	onDestroy(() => unmount());

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['flex flex-col', '$preset', klass],
		// `variantProps`, not a spread: these are Bond state, and only some of them are DOM
		// attributes. Spreading them painted `schema="[object Object]"`, `extend="[object Object]"`
		// and `type="undefined"` onto the group element. Presets can still
		// select on disabled/readonly/required through this seam — the same shape `Input.Root` uses.
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ field: bond },
	el.motion(),
	el
)}
