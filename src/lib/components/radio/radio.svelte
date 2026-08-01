<script lang="ts">
	import { getRadioGroupContext } from './context';
	import { Stack } from '../stack';
	import { toClassValue } from '$svelte-atoms/core/utils';
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { animateRadioIndicatorIn, animateRadioIndicatorOut } from './motion';

	const radioGroupContext = getRadioGroupContext();

	let {
		class: klass = '',
		preset = undefined,
		value = $bindable(undefined),
		group = $bindable(),
		id = undefined,
		name = undefined,
		disabled = false,
		required = false,
		readonly = false,
		onchange = undefined,
		oninput = undefined,
		checkedContent = undefined,
		...restProps
	} = $props();

	const radioProps = $derived(mergePresetProps(preset, 'radio', restProps));

	const _disabled = $derived(radioGroupContext?.disabled);
	const _required = $derived(radioGroupContext?.required);
	const _readonly = $derived(radioGroupContext?.readonly);
	const _name = $derived(radioGroupContext?.name);

	const proxy = {
		get current() {
			return radioGroupContext?.value ?? group;
		},
		set current(v) {
			group = v;
			if (radioGroupContext) {
				radioGroupContext.value = v;
			}
		}
	};

	const isDisabled = $derived(_disabled || disabled);
	const isRequired = $derived(_required || required);
	const isReadonly = $derived(_readonly || readonly);
	const isChecked = $derived(proxy.current === value);

	const checkedContentSnippet = $derived(isChecked ? checkedContent ? customCheckedContent: defaultCheckedContent : undefined);

	function handleChange(ev: Event) {
		const checked = (ev.currentTarget as HTMLInputElement)?.checked ?? false;

		onchange?.(ev, {
			checked,
			value: checked,
			type: 'boolean'
		});
	}

	function handleInput(ev: Event) {
		const currentTarget = ev.currentTarget as HTMLInputElement;
		const _checked = currentTarget?.checked ?? false;

		oninput?.(ev, {
			checked: _checked,
			value: _checked,
			type: 'boolean'
		});

		if (ev.defaultPrevented) {
			return;
		}
	}
</script>

{#snippet defaultCheckedContent()}
	<Stack.Item 
		class="rounded-inherit pointer-events-none size-full scale-[0.6] bg-current" 
		enter={animateRadioIndicatorIn()}
		exit={animateRadioIndicatorOut()}
	/>
{/snippet}

{#snippet customCheckedContent()}
	<HtmlAtom
		class="rounded-inherit pointer-events-none size-full scale-[0.6] bg-current"
		base={checkedContent}
		enter={animateRadioIndicatorIn()}
		exit={animateRadioIndicatorOut()}
	/>
{/snippet}

<Stack.Root
	class={[
		'text-foreground bg-input box-border inline-flex aspect-square size-4 max-h-fit max-w-fit cursor-pointer place-items-center rounded-full border border-border p-0',
		isDisabled && 'pointer-events-none opacity-50',
		toClassValue(klass, {})
	]}
	as="label"
	{...radioProps}
>
	<Stack.Item class="pointer-events-none flex size-full">
		<input
			bind:group={proxy.current}
			{id}
			{value}
			class="pointer-events-auto size-0 opacity-0"
			type="radio"
			name={_name ?? name}
			disabled={isDisabled}
			required={isRequired}
			readonly={isReadonly}
			onchange={handleChange}
			oninput={handleInput}
		/>
	</Stack.Item>

	{@render checkedContentSnippet?.()}
</Stack.Root>
