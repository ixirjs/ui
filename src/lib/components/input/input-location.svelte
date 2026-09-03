<script lang="ts">
	import {
		buildLocationSegments,
		isValidLatitude,
		isValidLongitude,
		LOCATION_SEGMENT_STYLES,
		parseLocationCoords
	} from './location';
	import { useControl } from './shared';
	import SegmentedField from './segmented-field.svelte';
	import type { InputBond as InputBondType } from './bond.svelte';
	import type { InputLocationControlProps } from './types';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import { createParsedValue } from './parsed-value.svelte';

	let {
		class: klass = '',
		value = $bindable(''),
		lat = $bindable<number | undefined>(undefined),
		lng = $bindable<number | undefined>(undefined),
		format = 'dd',
		precision = 6,
		placeholder = 'lat, lng',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.location',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputLocationControlProps = $props();

	// No `class` here: `klass` goes to <SegmentedField>, which folds it against the bond itself.
	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		type: () => 'text'
	});

	let isFocused = $state(false);

	const segments = $derived(buildLocationSegments(value, { format, precision }));

	type Coordinates = { lat: number | undefined; lng: number | undefined };
	const parsedValue = createParsedValue<string, Coordinates>({
		raw: { get: () => value, set: (next) => (value = next) },
		parsed: {
			get: () => ({ lat, lng }),
			set: (next) => {
				lat = next.lat;
				lng = next.lng;
			}
		},
		parse: (raw) => {
			if (!raw.trim()) return { value: { lat: undefined, lng: undefined } };
			const coords = parseLocationCoords(raw);
			return coords && isValidLatitude(coords.lat) && isValidLongitude(coords.lng)
				? { value: coords }
				: undefined;
		},
		format: (coords) =>
			coords.lat === undefined || coords.lng === undefined ? value : `${coords.lat}, ${coords.lng}`,
		preferRaw: (raw) => raw.trim() !== '',
		equalsParsed: (left, right) => left.lat === right.lat && left.lng === right.lng,
		onRawChange: (raw) => control.setValue(raw)
	});

	// SegmentedField owns the value write and the bond write; this adds the coordinate sync and
	// the lat/lng detail the location control's own callback contract promises.
	function handleValueChange(next: string, context: StateChangeContext<InputBondType>) {
		parsedValue.setRaw(next);
		onvaluechange?.(next, { ...context, lat, lng });
	}

	// Paste: normalise common coordinate formats before it reaches the field.
	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const pasted = ev.clipboardData?.getData('text') ?? '';
		const coords = parseLocationCoords(pasted);
		const next = coords ? `${coords.lat}, ${coords.lng}` : pasted;

		parsedValue.setRaw(next);
		control.notify(onvaluechange, next, ev, 'paste', { lat, lng });
	}
</script>

<!--
  Two layers: transparent-text <input> on top (caret, selection, native editing) over a coloured
  overlay <span>, shown only while blurred. Markup and scroll-sync live in <SegmentedField>.
-->
<SegmentedField
	type="text"
	inputmode="decimal"
	autocomplete="off"
	spellcheck={false}
	bind:value
	{segments}
	kindStyle={LOCATION_SEGMENT_STYLES}
	overlayWhen={!isFocused}
	{placeholder}
	{disabled}
	{readonly}
	class={klass}
	{control}
	{onchange}
	{oninput}
	onvaluechange={handleValueChange}
	onpaste={handlePaste}
	onfocus={() => (isFocused = true)}
	onblur={() => (isFocused = false)}
/>
