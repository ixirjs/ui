<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { InputBond, type InputStateProps } from './bond.svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { Factory } from '$ixirjs/ui/types';
	import type { InputRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		value,
		checked = undefined,
		files = [],
		preset = undefined,
		children = undefined,
		factory = (props: InputStateProps) => InputBond.create(props),
		...restProps
	}: InputRootProps<E, B> = $props();

	const root = useRoot(
		InputBond,
		{
			// Bridge HTML-input prop shapes to the bond's domain props (was loose `defineProperty`).
			value: [
				() => value as InputStateProps['value'],
				(v) => {
					value = v as typeof value;
				}
			],
			checked: [
				() => checked as InputStateProps['checked'],
				(v) => {
					checked = v as typeof checked;
				}
			],
			files: [
				() => files as InputStateProps['files'],
				(v) => {
					files = [...(v ?? [])];
				}
			]
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: () => factory as Factory<InputBond>
		}
	);
	const bond = root.bond;

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: [
			'text-foreground bg-input relative flex h-10 w-auto items-center overflow-hidden rounded-md border',
			'$preset',
			klass
		],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { input: bond })}
