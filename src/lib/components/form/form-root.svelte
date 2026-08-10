<script lang="ts" generics="B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps, type Base } from '$ixirjs/ui/components/atom';
	import { useRoot } from '$ixirjs/ui/shared';
	import { isPromise } from '$ixirjs/ui/shared/capability/models/validation.svelte';
	import { FormBond } from './bond.svelte';
	import type { FormRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		renderless = false,
		schema = undefined,
		source = undefined,
		errors = undefined,
		mode = undefined,
		blockInvalidSubmit = false,
		onvalidate = undefined,
		onsubmit = undefined,
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
			schema: () => schema,
			source: () => source,
			errors: () => errors,
			mode: () => mode
		},
		{ atom: false, id: () => ID, factory: () => factory }
	);
	const bond = root.bond;

	export const getBond = root.getBond;

	function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		bond.markSubmitted();
		const result = bond.validate();

		// ponytail: with an async schema we cannot know the verdict before the browser navigates, so
		// `blockInvalidSubmit` blocks unconditionally there and hands the promise to `onvalidate`.
		// Upgrade path if that is ever too blunt: await, then re-dispatch via requestSubmit().
		if (blockInvalidSubmit && (isPromise(result) || bond.isInvalid)) event.preventDefault();

		if (onvalidate) {
			const notify = () =>
				onvalidate({
					values: bond.values,
					errors: bond.allErrors,
					valid: bond.isValid,
					trigger: 'submit'
				});
			if (isPromise(result)) void result.then(notify);
			else notify();
		}

		// Ours first, so a consumer's native handler reads fresh errors off the bond. It keeps the
		// SubmitEvent untouched otherwise — preventing default is the consumer's call, not ours.
		onsubmit?.(event);
	}

	const content = $derived(renderless ? children : renderfull);

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	// The seam is spelled out rather than passed `root`: an `atom: false` root owns a Bond and
	// nothing else, so it has no `atom`/`preset`/`presetLayer` to hand over.
	const el = Kernel.element(
		{ atom: undefined, bond, preset: undefined, presetLayer: undefined },
		() => ({
			class: ['$preset', klass],
			as: 'form',
			...formProps,
			onsubmit: handleSubmit
		})
	);
</script>

{@render content?.({ form: bond })}

{#snippet renderfull({ form }: { form: FormBond })}
	{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, { form }, el.motion(), el)}
{/snippet}
