<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { AlertBond } from './bond.svelte';
	import type { AlertRootProps } from './types';
	import './alert.css';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		disabled = false,
		extend = {},
		factory = undefined,
		children,
		...restProps
	}: AlertRootProps<E, B> = $props();

	const root = useRoot(
		AlertBond,
		{
			disabled: () => disabled,
			extend: () => extend
		},
		{ id: () => ID, preset: () => preset, factory: () => factory }
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: [
			'alert border-border relative flex gap-1 rounded-md border p-4 transition-all duration-200',
			'bg-background text-foreground',
			{
				'pointer-events-none opacity-50': disabled
			},
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render partElement(el, children, { alert: bond })}
