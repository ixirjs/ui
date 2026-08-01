<script lang="ts" generics="T = string">
	import { mergePresetProps, HtmlAtom } from '$ixirjs/ui/components/atom';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { RadioGroupBond } from './bond.svelte';
	import type { RadioGroupProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		disabled = false,
		readonly = false,
		required = false,
		name = undefined,
		value = $bindable(),
		children,
		onvaluechange = undefined,
		...restProps
	}: RadioGroupProps<T> = $props();

	const valueProp = controlledProp<T | undefined, RadioGroupBond<T>>({
		get: () => value,
		set: (next) => (value = next)
	});
	// Explicit Bond type argument: this family is generic in `T`, and inferring the Bond from the
	// definition alone collapses it to `RadioGroupBond<unknown>`.
	const root = useRoot<typeof RadioGroupBond, RadioGroupBond<T>>(
		RadioGroupBond,
		{
			value: valueProp,
			disabled: () => disabled,
			readonly: () => readonly,
			required: () => required,
			name: () => name,
			onvaluechange: () => onvaluechange
		},
		{ atom: false, id: () => ID, factory: () => (props) => new RadioGroupBond<T>(props) }
	);
	const bond = root.bond;
	const groupProps = $derived(mergePresetProps(preset, 'radio.group', restProps));

	export function getBond(): RadioGroupBond<T> {
		return bond;
	}
</script>

<HtmlAtom class={['flex flex-col gap-1', '$preset', klass]} {...groupProps}>
	{@render children?.({})}
</HtmlAtom>
