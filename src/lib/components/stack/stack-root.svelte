<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { StackBond, type StackStateProps } from './bond.svelte';
	import type { StackRootProps } from './types';
	import './stack.css';

	const ID = $props.id();

	let {
		value = $bindable<string | undefined>(undefined),
		class: klass = '',
		preset = undefined,
		factory = defaultFactory,
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
			factory: (props) => factory(props)
		}
	);
	const bond = root.bond;

	function defaultFactory(props: StackStateProps) {
		return StackBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['stack-root', '$preset', klass]} {...root.props} {...restProps} part={root}>
	{@render children?.({})}
</HtmlAtom>
