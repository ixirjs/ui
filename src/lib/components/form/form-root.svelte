<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		mergePresetProps,
		HtmlAtom,
		type HtmlAtomProps,
		type Base
	} from '$svelte-atoms/core/components/atom';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import type { Override, Factory } from '$svelte-atoms/core/types';
	import { FormBond, type FormProps } from './bond.svelte';
	import type { PresetKey } from '$svelte-atoms/core/context/preset.svelte';

	// Available on both the renderless and renderfull branches (preset is otherwise only on the
	// renderfull `HtmlAtomProps` side, and validator was undeclared).
	type CommonProps = {
		factory?: Factory<FormBond>;
		validator?: unknown;
		preset?: PresetKey;
	};

	type RenderlessProps = {
		renderless?: true;
		children?: Snippet<[{ form: FormBond }]>;
	};

	type RenderfullProps<B extends Base = Base> = Override<
		HtmlAtomProps<'form', B>,
		{
			renderless?: false;
			children?: Snippet<[{ form: FormBond }]>;
		}
	>;

	export type FormRootProps<B extends Base = Base> = CommonProps &
		(RenderlessProps | RenderfullProps<B>);
</script>

<script lang="ts" generics="B extends Base = Base">
	let {
		class: klass = '',
		renderless = false,
		validator = undefined,
		factory = defaultFactory,
		children = undefined,
		preset = undefined,
		...restProps
	}: FormRootProps<B> & HTMLAttributes<HTMLFormElement> = $props();

	const formProps = $derived(mergePresetProps(preset, 'form', restProps));

	const binding = bindBond<FormBond>((props) => factory(props), {
		renderless: () => renderless,
		validator: () => validator
	});
	const bond = binding.bond.share();

	export function getBond() {
		return bond;
	}

	const content = $derived(renderless ? children : renderfull);

	function defaultFactory(props: FormProps) {
		return new FormBond(props);
	}
</script>

{#snippet renderfull({ form }: { form: FormBond })}
	<HtmlAtom bond={form} class={['$preset', klass]} as="form" {...formProps}>
		{@render children?.({ form })}
	</HtmlAtom>
{/snippet}

{@render content?.({ form: bond })}
