<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base } from '$ixirjs/ui/authoring';
	import { isPromise } from '$ixirjs/ui/capability/models/validation.svelte';
	import { FormBond, FormContext } from './bond.svelte';
	import type { FormRootProps } from './types';

	const ID = $props.id();

	let {
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
		...restProps
	}: FormRootProps = $props();

	// Live props: read through getters wherever the Bond needs them.
	const bondProps = {
		get id() {
			return ID;
		},
		get renderless() {
			return renderless;
		},
		get schema() {
			return schema;
		},
		get source() {
			return source;
		},
		get errors() {
			return errors;
		},
		get mode() {
			return mode;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = FormContext.share(build ? build(bondProps) : FormBond.create(bondProps));
	export const getBond = () => bond;

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

	// `base` lives only on the render-full half of the props union, so it is read off the rest.
	const el = Kernel.element(() => restProps, {
		preset: 'form',
		class: '',
		as: 'form',
		base: () => (restProps as { base?: Base }).base,
		state: bond,
		attrs: () => ({ onsubmit: handleSubmit })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render content?.({ form: bond })}

{#snippet renderfull({ form }: { form: FormBond })}
	{@render leaf(el, children, { form })}
{/snippet}
