<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { StackBond } from './bond.svelte';
	import type { StackRootProps } from './types';
	import './stack.css';

	const ID = $props.id();

	let {
		value = $bindable<string | undefined>(undefined),
		class: klass = '',
		preset = undefined,
		factory = undefined,
		onvaluechange = undefined,
		children,
		...restProps
	}: StackRootProps<E, B> = $props();

	const valueProp = controlledProp<string | undefined, StackBond>({
		get: () => value,
		set: (next) => (value = next),
		onchange: (next, context) => onvaluechange?.(next, context)
	});

	const root = useRoot(
		StackBond,
		{
			value: valueProp
		},
		{
			// `stack.root` is the fallback preset key, not `atom.preset` — keep the existing selection.
			preset: () => preset ?? 'stack.root',
			id: () => ID,
			factory: () => factory
		}
	);

	export const getBond: () => StackBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['stack-root', '$preset', klass],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, {})}
