<script lang="ts" generics="E extends keyof HTMLElementTagNameMap='dialog', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { ActivePortal, PortalSurface } from '$ixirjs/ui/components/portal';
	import type { Base } from '$ixirjs/ui/components/atom';
	import { DrawerBond } from './bond.svelte';
	import type { SlideoverRootProps } from './types';
	import { animateDrawerRoot } from './motion.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { mergeAtomProps } from '$ixirjs/ui/components/atom';

	type Element = HTMLElementTagNameMap[E];

	const ID = $props.id();

	let {
		open = $bindable(false),
		side = 'right',
		children = undefined,
		class: klass = '',
		preset = undefined,
		disabled = false,
		portal = undefined,
		presets = undefined,
		position = 'fixed',
		'z-index': zindex = undefined,
		order = undefined,
		onopenchange = undefined,
		// swallowed: defaults is an internal HtmlAtom layer, not a public Drawer.Root override.
		defaults: _defaults = undefined,
		// swallowed: old fallback prop is removed; keep it off the DOM spread.
		fallback: _fallback = undefined,
		factory = (props) => DrawerBond.create(props),
		...restProps
		// Omit `children` from HTMLAttributes: it declares `children?: Snippet` (0-arg), which would
		// intersect with SlideoverRootProps' 1-arg `DrawerChildren` into an unsatisfiable type.
	}: SlideoverRootProps<E, B> & Omit<HTMLAttributes<Element>, 'children'> = $props();

	const openProp = controlledProp<boolean, DrawerBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		DrawerBond,
		{
			open: openProp,
			disabled: () => disabled,
			side: () => side,
			presets: () => presets
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: (props) => factory(props)
		}
	);
	const bond = root.bond;

	const defaults = {
		animate: animateDrawerRoot({}),
		initial: animateDrawerRoot({ duration: 0 })
	};

	// The merged packet, not the direct seam: `PortalSurface` is another component.
	const rootProps = $derived(
		mergeAtomProps(root.atom, preset, { ...root.props, ...restProps }, root.presetLayer)
	);

	export function getBond() {
		return bond;
	}
</script>

<PortalSurface
	owner={bond}
	band="modal"
	{order}
	{portal}
	z-index={zindex}
	class={[
		'pointer-events-none inset-0 h-full w-full overflow-hidden bg-transparent',
		!openProp.value && 'pointer-events-none',
		'$preset',
		klass
	]}
	style="position: {position};"
	closeby="none"
	{defaults}
	{...rootProps}
>
	<ActivePortal>
		{@render children?.({ drawer: bond })}
	</ActivePortal>
</PortalSurface>
