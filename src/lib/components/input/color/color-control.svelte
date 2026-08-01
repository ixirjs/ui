<script lang="ts">
	import {
		inputChangeContext,
		resolveControlPreset,
		writeInputValue
	} from '$ixirjs/ui/components/input/shared';
	import { clamp } from '$ixirjs/ui/utils/math';
	import { cn, toClassValue } from '$ixirjs/ui/utils';
	import { InputBond } from '$ixirjs/ui/components/input/bond.svelte';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import type { InputColorControlProps } from './types';
	import type { ColorFormat, ChannelValues, ChannelDef } from './types';
	import Segment from './segment.svelte';
	import { FORMAT_DEFS, parseColor, buildColor, detectFormat } from './shared';

	const bond = InputBond.get();

	let {
		class: klass = '',
		value = $bindable(''),
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

	const preset = resolveControlPreset(
		() => presetKey,
		bond,
		() => restProps,
		() => toClassValue(klass, bond)
	);

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

	function focusSeg(i: number) {
		segRefs[clamp(i, 0, segCount - 1)]?.focus();
	}

	// Mirror the bindable value onto the bond state.
	$effect(() => {
		writeInputValue(bond, value);
	});

	function commitValue(built: string, event: Event | undefined, reason: string) {
		const changed = built !== value;
		value = built;
		writeInputValue(bond, built);
		if (changed) {
			onvaluechange?.(value, inputChangeContext(bond, event, reason));
		}
	}

	function handleChannelChange(
		channelId: string,
		val: number | string | undefined,
		context: StateChangeContext
	) {
		const newChannels = channelId === 'alpha' ? channels : { ...channels, [channelId]: val };
		const newAlpha = channelId === 'alpha' ? (val as number | undefined) : alpha;
		commitValue(buildColor(activeFormat, newChannels, newAlpha), context.event, 'input');
	}

	function handleChannelCommit(
		channelId: string,
		val: number | string | undefined,
		context: StateChangeContext
	) {
		const newChannels = channelId === 'alpha' ? channels : { ...channels, [channelId]: val };
		const newAlpha = channelId === 'alpha' ? (val as number | undefined) : alpha;
		commitValue(buildColor(activeFormat, newChannels, newAlpha), context.event, 'commit');
	}
</script>

<span
	class={cn(
		'inline-flex h-full items-center gap-0.5 px-2',
		disabled && 'cursor-not-allowed opacity-50',
		preset.class
	)}
	{...preset.attrs}
>
	{#if value || def}
		{@const isHexFmt = activeFormat === 'hex'}
		{@const isNamedFmt = activeFormat === 'named'}
		{@const alphaIdx = def.channels.length}

		<!-- Named: single plain-text input -->
		{#if isNamedFmt}
			<input
				type="text"
				spellcheck={false}
				autocomplete="off"
				value={String(channels['name'] ?? '')}
				placeholder="e.g. red, cornflowerblue"
				{disabled}
				{readonly}
				class="min-w-[12ch] bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
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

			<!-- Hex: # prefix then R G B [A] -->
		{:else if isHexFmt}
			<span class="select-none font-mono text-sm text-muted-foreground">#</span>
			{#each def.channels as ch, i (ch.id)}
				<Segment
					bind:this={segRefs[i]}
					value={channels[ch.id]}
					channel={ch}
					{disabled}
					{readonly}
					{oninput}
					{onchange}
					onvaluechange={(v, context) => handleChannelChange(ch.id, v, context)}
					oncommit={(v, context) => handleChannelCommit(ch.id, v, context)}
					onfocusmove={(dir) => focusSeg(i + dir)}
				/>
			{/each}
			{#if hasAlpha}
				<span class="mx-0.5 select-none font-mono text-sm text-muted-foreground/50">·</span>
				<Segment
					bind:this={segRefs[alphaIdx]}
					value={alpha}
					channel={alphaDef}
					{disabled}
					{readonly}
					{oninput}
					{onchange}
					onvaluechange={(v, context) => handleChannelChange('alpha', v, context)}
					oncommit={(v, context) => handleChannelCommit('alpha', v, context)}
					onfocusmove={(dir) => focusSeg(alphaIdx + dir)}
				/>
			{/if}

			<!-- Functional: fn( ch sep ch sep ch [/ alpha] ) -->
		{:else}
			<span class="select-none font-mono text-sm text-blue-500 dark:text-blue-400">{def.fn}</span>
			{#if def.colorspace}
				<span class="select-none font-mono text-sm text-muted-foreground">(</span>
				<span class="mr-1 select-none font-mono text-sm text-violet-500 dark:text-violet-400"
					>{def.colorspace}</span
				>
			{:else}
				<span class="select-none font-mono text-sm text-muted-foreground">(</span>
			{/if}

			{#each def.channels as ch, i (ch.id)}
				{#if i > 0}
					<span class="select-none font-mono text-sm text-muted-foreground/50"
						>{def.sep.trim() || ' '}</span
					>
				{/if}
				<Segment
					bind:this={segRefs[i]}
					value={channels[ch.id]}
					channel={ch}
					{disabled}
					{readonly}
					{oninput}
					{onchange}
					onvaluechange={(v, context) => handleChannelChange(ch.id, v, context)}
					oncommit={(v, context) => handleChannelCommit(ch.id, v, context)}
					onfocusmove={(dir) => focusSeg(i + dir)}
				/>
			{/each}

			{#if hasAlpha}
				<span class="mx-0.5 select-none font-mono text-sm text-muted-foreground">/</span>
				<Segment
					bind:this={segRefs[alphaIdx]}
					value={alpha}
					channel={alphaDef}
					{disabled}
					{readonly}
					{oninput}
					{onchange}
					onvaluechange={(v, context) => handleChannelChange('alpha', v, context)}
					oncommit={(v, context) => handleChannelCommit('alpha', v, context)}
					onfocusmove={(dir) => focusSeg(alphaIdx + dir)}
				/>
			{/if}

			<span class="select-none font-mono text-sm text-muted-foreground">)</span>
		{/if}
	{:else}
		<span class="font-mono text-sm text-muted-foreground">{placeholder}</span>
	{/if}
</span>
