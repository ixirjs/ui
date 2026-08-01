<script lang="ts" generics="B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { useRoot } from '$ixirjs/ui/shared';
	import { FormBond } from './bond.svelte';
	import type { FormRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		renderless = false,
		validator = undefined,
		factory = undefined,
		children = undefined,
		preset = undefined,
		...restProps
	}: FormRootProps<B> = $props();

	const formProps = $derived(mergePresetProps(preset, 'form', restProps));

	const root = useRoot(
		FormBond,
		{
			renderless: () => renderless,
			validator: () => validator
		},
		{ atom: false, id: () => ID, factory: () => factory }
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}

	const content = $derived(renderless ? children : renderfull);
</script>

{#snippet renderfull({ form }: { form: FormBond })}
	<HtmlAtom bond={form} class={['$preset', klass]} as="form" {...formProps}>
		{@render children?.({ form })}
	</HtmlAtom>
{/snippet}

{@render content?.({ form: bond })}
