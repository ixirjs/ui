<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { DataGridBond, DataGridContext } from './bond.svelte';
	import type { DatagridRootProps } from './types';
	import './datagrid.css';

	const ID = $props.id();

	let {
		as = undefined,
		base = undefined,
		values = $bindable([]),
		template = undefined,
		fallbackTemplate = 'auto',
		factory = undefined,
		onvalueschange = undefined,
		children = undefined,
		...restProps
	}: DatagridRootProps<T, E, B> = $props();

	const bondProps = {
		get id() {
			return ID;
		},
		get template() {
			return template;
		},
		get values() {
			return values;
		}
	};
	const build = untrack(() => factory);
	const bond = DataGridContext.share(
		(build ? build(bondProps) : DataGridBond.create<T>(bondProps)) as DataGridBond
	) as DataGridBond<T>;
	// Report the stored value, not `next`: a bindable's fallback is a state proxy, and a consumer
	// comparing the callback's array with `bond.props.values` must see one reference.
	bond.bindCommit((next, context) => {
		values = next;
		onvalueschange?.(values, context);
	});

	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'datagrid',
		class: 'datagrid-root w-full gap-x-0 gap-y-0',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => ({
			id: Kernel.id(ID, 'datagrid-root'),
			role: 'grid',
			style: `--template-columns:${bond.template || fallbackTemplate}`
		})
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { datagrid: bond })}
