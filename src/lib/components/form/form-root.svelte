<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { HtmlAtom, type HtmlAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import type { Override, Factory } from '$svelte-atoms/core/types';
	import { FormBond, FormBondState, type FormProps } from './bond.svelte';

	type CommonProps = {
		factory?: Factory<FormBond>;
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

	const formProps = $derived({ preset: preset ?? 'form', ...restProps });

	const binding = bindBond<FormBond>(
		(props) => factory(props),
		{
			renderless: () => renderless,
			validator: () => validator,
			rest: () => restProps
		}
	);
	const bond = binding.bond.share();

	function defaultFactory(props: FormProps) {
		// Placeholder for any factory logic if needed

		const bondState = new FormBondState(props);

		return new FormBond(bondState);
	}

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
