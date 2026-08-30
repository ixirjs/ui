<script lang="ts" generics="T = string">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import {
		RadioGroupContext,
		type RadioCheckedChangeListener,
		type RadioGroupBond
	} from './bond.svelte';
	import { animateRadioIndicatorIn, animateRadioIndicatorOut } from './motion.svelte';
	import type { RadioProps } from './types';
	import '$ixirjs/ui/components/stack/stack.css';

	const ID = $props.id();
	const radioGroupBond = RadioGroupContext.get() as RadioGroupBond<T> | undefined;

	// `children` is taken out and not rendered: the label's content was always the control and the
	// indicator, and consumer children never reached the DOM.
	let {
		class: klass = '',
		value = $bindable(undefined),
		group = $bindable(),
		id = undefined,
		name = undefined,
		disabled = false,
		required = false,
		readonly = false,
		onchange = undefined,
		oninput = undefined,
		oncheckedchange = undefined,
		checkedContent = undefined,
		children: _children = undefined,
		...restProps
	}: RadioProps<T> = $props();

	const _disabled = $derived(radioGroupBond?.props.disabled);
	const _required = $derived(radioGroupBond?.props.required);
	const _readonly = $derived(radioGroupBond?.props.readonly);
	const _name = $derived(radioGroupBond?.props.name);

	const proxy = {
		get current() {
			return radioGroupBond?.props.value ?? group;
		},
		set current(v) {
			group = v;
			if (radioGroupBond) {
				radioGroupBond.props.value = v;
			}
		}
	};

	const isDisabled = $derived(_disabled || disabled);
	const isRequired = $derived(_required || required);
	const isReadonly = $derived(_readonly || readonly);
	const isChecked = $derived(proxy.current === value);

	const notifyChecked: RadioCheckedChangeListener = (nextChecked, event) => {
		oncheckedchange?.(nextChecked, { event });
	};

	// Registered at init — document order — and released on teardown; the handle reads `value` live.
	if (radioGroupBond) {
		const detach = radioGroupBond.attachItem({
			get value() {
				return value;
			},
			notify: notifyChecked
		});
		$effect(() => detach);
	}

	let hasStandaloneInitialized = false;
	let previousStandaloneChecked = false;
	let pendingStandaloneEvent: Event | undefined;

	$effect(() => {
		if (radioGroupBond) return;

		const nextChecked = isChecked;
		if (hasStandaloneInitialized && previousStandaloneChecked !== nextChecked) {
			if (pendingStandaloneEvent) notifyChecked(nextChecked, pendingStandaloneEvent);
			else oncheckedchange?.(nextChecked, {});
		}

		previousStandaloneChecked = nextChecked;
		pendingStandaloneEvent = undefined;
		hasStandaloneInitialized = true;
	});

	function handleChange(event: Event) {
		onchange?.(event);
	}

	function select(event: Event) {
		if (value === undefined) return false;

		if (radioGroupBond) {
			return radioGroupBond.select(value, event, notifyChecked);
		}

		if (Object.is(group, value)) return false;
		group = value;
		return true;
	}

	function handleInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		oninput?.(event);

		if (!input.checked) return;

		if (!radioGroupBond) pendingStandaloneEvent = event;
		if (!select(event) && !radioGroupBond) pendingStandaloneEvent = undefined;
	}

	// The label used to mount `Stack.Root` with two `Stack.Item`s; it renders them itself now, with
	// the same `stack-*` classes (the grid that overlays the indicator on the control) and ids. State
	// classes ride the consumer layer's `class` (Kernel's own-attrs `class` is not merged).
	const el = Kernel.element(
		() => ({
			class: [
				'text-foreground bg-input box-border inline-flex aspect-square size-4 max-h-fit max-w-fit cursor-pointer place-items-center rounded-full border border-border p-0',
				isDisabled && 'pointer-events-none opacity-50',
				klass
			],
			...restProps
		}),
		{
			preset: 'radio',
			class: 'stack-root',
			state: radioGroupBond,
			attrs: () => ({ id: Kernel.id(ID, 'stack-root') })
		}
	);
	// One indicator element for both the default and the custom (`base`) content. Declared here, not
	// in a snippet: the seam owns effects and must be created during init.
	const indicatorMotion = { enter: animateRadioIndicatorIn(), exit: animateRadioIndicatorOut() };
	const indicatorEl = Kernel.element(() => ({}), {
		preset: 'stack.item',
		class: 'stack-item rounded-inherit pointer-events-none size-full scale-[0.6] bg-current',
		base: () => checkedContent,
		motion: () => indicatorMotion,
		// The `data-*`/`z-index` hooks `Stack.Item` used to emit here. `data-active` was always
		// `false` on this pair — the overlay has no Stack Bond to be the active value of — and it is
		// kept literal so a consumer's `[data-active]` selector still matches what it always matched.
		attrs: () => ({
			'data-value': 'indicator',
			'data-active': false,
			id: Kernel.id(ID, 'stack-item-indicator'),
			'data-stack-item': 'indicator',
			style: 'z-index: 0'
		})
	});
	const indicator = Kernel.render(indicatorEl);
</script>

<label {...el.attrs}>
	<div
		class="border-border stack-item pointer-events-none flex size-full"
		data-value="control"
		data-active="false"
		id={Kernel.id(ID, 'stack-item-control')}
		data-stack-item="control"
		style="z-index: 0"
	>
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
	</div>

	{@render (isChecked ? indicator : undefined)?.(indicatorEl)}
</label>
