<script lang="ts">
	import { useControl, INPUT_DISABLED_CLASS } from '../shared';
	import { clamp } from '$ixirjs/ui/utils/math';
	import HiddenInput from '../hidden-input.svelte';
	import { cn } from '$ixirjs/ui/utils';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import type { InputColorControlProps } from './types';
	import type { InputChangeReason } from '../types';
	import type { ColorFormat, ChannelValues, ChannelDef } from './types';
	import Segment from './segment.svelte';
	import { FORMAT_DEFS, parseColor, buildColor, detectFormat } from './shared';

	let {
		class: klass = '',
		value = $bindable(''),
		name = undefined,
		format: formatProp = undefined,
		alpha: showAlpha = false,
		placeholder = 'oklch(0.5 0.2 250deg)',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.color',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputColorControlProps = $props();

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		type: () => 'color'
	});

	const activeFormat = $derived<ColorFormat>(formatProp ?? detectFormat(value) ?? 'hex');
	const def = $derived(FORMAT_DEFS[activeFormat]);

	const parsed = $derived(parseColor(value));
	// Only adopt parsed channels/alpha when they match the active format.
	const channels = $derived<ChannelValues>(parsed?.format === activeFormat ? parsed.channels : {});
	const alpha = $derived<number | undefined>(
		parsed?.format === activeFormat ? parsed.alpha : undefined
	);

	const hasAlpha = $derived(def.alpha && (showAlpha || alpha !== undefined));

	// Stable (non-inline) reference so the segment doesn't see a new channel each render.
	const alphaDef: ChannelDef = {
		id: 'alpha',
		label: 'Alpha',
		kind: 'float',
		min: 0,
		max: 1,
		precision: 2
	};

	let segRefs = $state<Array<{ focus(): void } | undefined>>([]);

	const segCount = $derived(def.channels.length + (hasAlpha ? 1 : 0));
	// Hoisted from template {@const}s: the format snippets below are declared at top level and
	// cannot inherit a block-scoped const.
	const isHexFmt = $derived(activeFormat === 'hex');
	const isNamedFmt = $derived(activeFormat === 'named');
	const alphaIdx = $derived(def.channels.length);

	function focusSeg(i: number) {
		segRefs[clamp(i, 0, segCount - 1)]?.focus();
	}

	function commitValue(built: string, event: Event | undefined, reason: InputChangeReason) {
		const changed = built !== value;
		value = built;
		control.setValue(built);
		if (changed) control.notify(onvaluechange, value, event, reason);
	}

	// One writer for both the per-keystroke `onvaluechange` and the on-blur `oncommit`; they only
	// ever differed in the reason they report.
	function handleChannel(
		channelId: string,
		val: number | string | undefined,
		context: StateChangeContext,
		reason: 'input' | 'commit'
	) {
		const newChannels = channelId === 'alpha' ? channels : { ...channels, [channelId]: val };
		const newAlpha = channelId === 'alpha' ? (val as number | undefined) : alpha;
		commitValue(buildColor(activeFormat, newChannels, newAlpha), context.event, reason);
	}
</script>

<span
	class={cn(
		'inline-flex h-full items-center gap-0.5 px-2',
		disabled && INPUT_DISABLED_CLASS,
		control.class
	)}
	role="group"
	aria-label="Color"
	{...control.attrs}
>
	<!-- Empty value falls back to the plain text field, so the control is typeable from scratch
	     instead of showing a dead placeholder span. -->
	{@render (value && !isNamedFmt ? (isHexFmt ? hexFormat : functionalFormat) : namedInput)()}
</span>

<HiddenInput {name} {value} />

<!-- Named: single plain-text input -->
{#snippet namedInput()}
	<input
		type="text"
		spellcheck={false}
		autocomplete="off"
		value={String(channels['name'] ?? '')}
		{placeholder}
		{disabled}
		{readonly}
		class="text-foreground placeholder:text-muted-foreground min-w-[12ch] bg-transparent font-mono text-sm outline-none"
		oninput={(event) => {
			oninput?.(event);
			if (event.defaultPrevented) return;
			const next = (event.currentTarget as HTMLInputElement).value.replace(/\s/g, '');
			commitValue(next, event, 'input');
		}}
		onchange={(event) => {
			onchange?.(event);
			if (event.defaultPrevented) return;
			const next = (event.currentTarget as HTMLInputElement).value.replace(/\s/g, '');
			commitValue(next, event, 'change');
		}}
	/>
{/snippet}

<!-- Hex: # prefix then R G B [A] -->
{#snippet hexFormat()}
	<span class="text-muted-foreground font-mono text-sm select-none">#</span>
	{#each def.channels as ch, i (ch.id)}
		{@render channelSegment(ch, i)}
	{/each}
	{@render (hasAlpha ? hexAlpha : undefined)?.()}
{/snippet}

<!-- Declared outside the {#each}, so it takes the channel and index it renders. -->
{#snippet channelSegment(ch: ChannelDef, i: number)}
	<Segment
		bind:this={segRefs[i]}
		value={channels[ch.id]}
		channel={ch}
		{disabled}
		{readonly}
		{oninput}
		{onchange}
		onvaluechange={(v, context) => handleChannel(ch.id, v, context, 'input')}
		oncommit={(v, context) => handleChannel(ch.id, v, context, 'commit')}
		onfocusmove={(dir) => focusSeg(i + dir)}
	/>
{/snippet}

{#snippet hexAlpha()}
	<span class="text-muted-foreground/50 mx-0.5 font-mono text-sm select-none">·</span>
	{@render alphaSegment()}
{/snippet}

{#snippet alphaSegment()}
	<Segment
		bind:this={segRefs[alphaIdx]}
		value={alpha}
		channel={alphaDef}
		{disabled}
		{readonly}
		{oninput}
		{onchange}
		onvaluechange={(v, context) => handleChannel('alpha', v, context, 'input')}
		oncommit={(v, context) => handleChannel('alpha', v, context, 'commit')}
		onfocusmove={(dir) => focusSeg(alphaIdx + dir)}
	/>
{/snippet}

<!-- Functional: fn( ch sep ch sep ch [/ alpha] ) -->
{#snippet functionalFormat()}
	<span
		class="font-mono text-sm select-none"
		style="color: var(--input-hl-primary, var(--foreground))">{def.fn}</span
	>
	<span class="text-muted-foreground font-mono text-sm select-none">(</span>
	{@render (def.colorspace ? colorspaceLabel : undefined)?.()}
	{#each def.channels as ch, i (ch.id)}
		{@render (i > 0 ? channelSeparator : undefined)?.()}
		{@render channelSegment(ch, i)}
	{/each}
	{@render (hasAlpha ? functionalAlpha : undefined)?.()}
	<span class="text-muted-foreground font-mono text-sm select-none">)</span>
{/snippet}

{#snippet colorspaceLabel()}
	<span
		class="mr-1 font-mono text-sm select-none"
		style="color: var(--input-hl-secondary, var(--foreground))">{def.colorspace}</span
	>
{/snippet}

{#snippet channelSeparator()}
	<span class="text-muted-foreground/50 font-mono text-sm select-none">{def.sep.trim() || ' '}</span
	>
{/snippet}

{#snippet functionalAlpha()}
	<span class="text-muted-foreground mx-0.5 font-mono text-sm select-none">/</span>
	{@render alphaSegment()}
{/snippet}
