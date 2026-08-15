import { renderPropsRow, type PropDefinition } from '$docs/types';

export const elementProps: PropDefinition[] = [
	{
		name: 'animate',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Animation applied on each update.'
	},
	{
		name: 'as',
		type: 'T | (string & {})',
		default: 'undefined',
		description: 'Polymorphic tag override — render as a different HTML element.'
	},
	{
		name: 'class',
		type: 'ClassValue | ClassValue[]',
		default: 'undefined',
		description:
			'CSS class(es) to apply. Accepts any Svelte `ClassValue`, including arrays and objects.'
	},
	{
		name: 'enter',
		type: 'TransitionFunction<ElementType<T>> | undefined',
		default: 'undefined',
		description: 'Transition run when the element enters.'
	},
	{
		name: 'exit',
		type: 'TransitionFunction<ElementType<T>> | undefined',
		default: 'undefined',
		description: 'Transition run when the element exits.'
	},
	{
		name: 'global',
		type: 'boolean',
		default: 'undefined',
		description: 'Emit styles as `:global` rather than scoped.'
	},
	{
		name: 'initial',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Runs once on mount, before the enter transition.'
	},
	{
		name: 'motion',
		type: 'Motion<ElementType<T>> | null | undefined',
		default: 'undefined',
		description:
			'Renderer-owned motion channels. The flat phase props below remain accepted for compatibility.'
	},
	{
		name: 'ondestroy',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Called when the element is destroyed.'
	},
	{
		name: 'onmount',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Called when the element is mounted.'
	},
	renderPropsRow
];

export const htmlElementEventProps: PropDefinition[] = [
	{
		name: 'onexitend',
		type: '(ev: TransitionEvent) => void',
		default: 'undefined',
		description: 'Fires when the exit transition finishes, after which the element may be removed.'
	},
	{
		name: 'onintroend',
		type: '(ev: TransitionEvent) => void',
		default: 'undefined',
		description:
			'Fires when the enter transition finishes. A real `TransitionEvent`, not the CustomEvent shape Svelte’s HTMLAttributes declares.'
	}
];

export const htmlElementProps: PropDefinition[] = [
	{
		name: 'animate',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Animation applied on each update.'
	},
	{
		name: 'as',
		type: 'T | (string & {})',
		default: 'undefined',
		description: 'Polymorphic tag override — render as a different HTML element.'
	},
	{
		name: 'children',
		type: 'Children',
		default: 'undefined',
		description: 'Content rendered inside the element.'
	},
	{
		name: 'class',
		type: 'ClassValue | ClassValue[]',
		default: 'undefined',
		description:
			'CSS class(es) to apply. Accepts any Svelte `ClassValue`, including arrays and objects.'
	},
	{
		name: 'defaults',
		type: 'Record<string, unknown> | undefined',
		default: 'undefined',
		description: 'Default attribute values applied before variants and consumer attributes.'
	},
	{
		name: 'enter',
		type: 'TransitionFunction<ElementType<T>> | undefined',
		default: 'undefined',
		description: 'Transition run when the element enters.'
	},
	{
		name: 'exit',
		type: 'TransitionFunction<ElementType<T>> | undefined',
		default: 'undefined',
		description: 'Transition run when the element exits.'
	},
	{
		name: 'global',
		type: 'boolean',
		default: 'undefined',
		description: 'Emit styles as `:global` rather than scoped.'
	},
	{
		name: 'initial',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Runs once on mount, before the enter transition.'
	},
	{
		name: 'motion',
		type: 'Motion<ElementType<T>> | null | undefined',
		default: 'undefined',
		description:
			'Renderer-owned motion channels. The flat phase props below remain accepted for compatibility.'
	},
	{
		name: 'ondestroy',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Called when the element is destroyed.'
	},
	{
		name: 'onexitend',
		type: '(ev: TransitionEvent) => void',
		default: 'undefined',
		description: 'Fires when the exit transition finishes, after which the element may be removed.'
	},
	{
		name: 'onintroend',
		type: '(ev: TransitionEvent) => void',
		default: 'undefined',
		description:
			'Fires when the enter transition finishes. A real `TransitionEvent`, not the CustomEvent shape Svelte’s HTMLAttributes declares.'
	},
	{
		name: 'onmount',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Called when the element is mounted.'
	},
	{
		name: 'preset',
		type: 'PresetKey | undefined',
		default: 'undefined',
		description: 'Preset key or ordered fallback chain (first registered key wins).'
	},
	{
		name: 'variants',
		type: 'Variants | undefined',
		default: 'undefined',
		description:
			'Variant definition — a static `VariantDefinition`, or a function receiving bond and props.'
	},
	renderPropsRow
];

export const svgElementProps: PropDefinition[] = [
	{
		name: 'animate',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Animation applied on each update.'
	},
	{
		name: 'as',
		type: '(string & {}) | T',
		default: 'undefined',
		description: 'Polymorphic tag override — render as a different HTML element.'
	},
	{
		name: 'children',
		type: 'Children',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'class',
		type: 'ClassValue | ClassValue[]',
		default: 'undefined',
		description:
			'CSS class(es) to apply. Accepts any Svelte `ClassValue`, including arrays and objects.'
	},
	{
		name: 'defaults',
		type: 'Record<string, unknown> | undefined',
		default: 'undefined',
		description: 'Default attribute values applied before variants and consumer attributes.'
	},
	{
		name: 'enter',
		type: 'TransitionFunction<ElementType<T>> | undefined',
		default: 'undefined',
		description: 'Transition run when the element enters.'
	},
	{
		name: 'exit',
		type: 'TransitionFunction<ElementType<T>> | undefined',
		default: 'undefined',
		description: 'Transition run when the element exits.'
	},
	{
		name: 'global',
		type: 'boolean',
		default: 'undefined',
		description: 'Emit styles as `:global` rather than scoped.'
	},
	{
		name: 'initial',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Runs once on mount, before the enter transition.'
	},
	{
		name: 'motion',
		type: 'Motion<ElementType<T>> | null | undefined',
		default: 'undefined',
		description:
			'Renderer-owned motion channels. The flat phase props below remain accepted for compatibility.'
	},
	{
		name: 'ondestroy',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Called when the element is destroyed.'
	},
	{
		name: 'onexitend',
		type: '(ev: TransitionEvent) => void',
		default: 'undefined',
		description: 'Fires when the exit transition finishes, after which the element may be removed.'
	},
	{
		name: 'onintroend',
		type: '(ev: TransitionEvent) => void',
		default: 'undefined',
		description:
			'Fires when the enter transition finishes. A real `TransitionEvent`, not the CustomEvent shape Svelte’s HTMLAttributes declares.'
	},
	{
		name: 'onmount',
		type: 'NodeFunction<T> | undefined',
		default: 'undefined',
		description: 'Called when the element is mounted.'
	},
	{
		name: 'preset',
		type: 'PresetKey | undefined',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'variants',
		type: 'Variants | undefined',
		default: 'undefined',
		description:
			'Variant definition — a static `VariantDefinition`, or a function receiving bond and props.'
	},
	renderPropsRow
];
