<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
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

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
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

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ alert: bond },
	el.motion(),
	el
)}
