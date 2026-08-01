<script lang="ts">
	import { resolveControlPreset, writeInputValue } from './shared';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import { InputBond } from './bond.svelte';
	import type { InputLocationControlProps } from './types';

	const bond = InputBond.get();

	let {
		class: klass = '',
		value = $bindable(''),
		lat = $bindable<number | undefined>(undefined),
		lng = $bindable<number | undefined>(undefined),
		format = 'dd',
		precision = 6,
		locate = true,
		placeholder = 'lat, lng',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.location',
		onchange = undefined,
		oninput = undefined,
		...restProps
	}: InputLocationControlProps = $props();

	const preset = resolveControlPreset(() => presetKey, bond);

	let inputEl = $state<HTMLInputElement>();
	let scrollLeft = $state(0);
	let locating = $state(false);
	let locationError = $state<string | undefined>(undefined);
	let isFocused = $state(false);

	// Coord parsing
	type ParsedCoords = { lat: number; lng: number } | null;

	// Accepts: "lat, lng" | "lat lng" | "lat;lng" — signed decimals or N/S/E/W suffix.
	function parseCoords(raw: string): ParsedCoords {
		if (!raw.trim()) return null;

		// Strip degree/minute/second symbols so pasted DMS parses too.
		const clean = raw.replace(/[°'"]/g, ' ').trim();
		const parts = clean.split(/[\s,;]+/).filter(Boolean);
		if (parts.length < 2) return null;

		function parsePart(s: string): number | null {
			const dir = /[NSEWnsew]$/.exec(s)?.[0]?.toUpperCase();
			const numeric = parseFloat(s.replace(/[NSEWnsew]$/i, ''));
			if (isNaN(numeric)) return null;
			if (dir === 'S' || dir === 'W') return -numeric;
			return numeric;
		}

		const parsedLat = parsePart(parts[0]!);
		const parsedLng = parsePart(parts[1]!);
		if (parsedLat === null || parsedLng === null) return null;
		return { lat: parsedLat, lng: parsedLng };
	}

	const isValidLat = (v: number) => v >= -90 && v <= 90;
	const isValidLng = (v: number) => v >= -180 && v <= 180;

	// Overlay segment types
	type SegmentKind =
		| 'lat-val'
		| 'lat-min'
		| 'lat-sec'
		| 'lat-dir'
		| 'lng-val'
		| 'lng-min'
		| 'lng-sec'
		| 'lng-dir'
		| 'sep'
		| 'symbol'
		| 'error';

	type Segment = { text: string; kind: SegmentKind };

	const kindStyle: Record<SegmentKind, string> = {
		'lat-val': 'color: var(--input-hl-positive, var(--foreground)); font-weight: 500',
		'lat-min': 'color: var(--input-hl-positive, var(--foreground))',
		'lat-sec': 'color: var(--input-hl-dim, var(--foreground))',
		'lat-dir': 'color: var(--input-hl-positive, var(--foreground)); font-weight: 600',
		'lng-val': 'color: var(--input-hl-primary, var(--foreground)); font-weight: 500',
		'lng-min': 'color: var(--input-hl-primary, var(--foreground))',
		'lng-sec': 'color: var(--input-hl-dim, var(--foreground))',
		'lng-dir': 'color: var(--input-hl-primary, var(--foreground)); font-weight: 600',
		sep: 'color: var(--input-hl-muted, var(--foreground))',
		symbol: 'color: var(--input-hl-muted, var(--foreground)); opacity: 0.6',
		error: 'color: var(--input-hl-error, var(--destructive))'
	};

	// DMS helpers
	function toDms(deg: number, hemi: 'lat' | 'lng') {
		const abs = Math.abs(deg);
		const d = Math.floor(abs);
		const mFull = (abs - d) * 60;
		const m = Math.floor(mFull);
		const s = (mFull - m) * 60;
		const pos = hemi === 'lat' ? 'N' : 'E';
		const neg = hemi === 'lat' ? 'S' : 'W';
		return { d, m, s, dir: deg >= 0 ? pos : neg };
	}

	// Build overlay segments
	function buildSegments(raw: string): Segment[] {
		if (!raw.trim()) return [];

		const coords = parseCoords(raw);
		if (!coords) return [{ text: raw, kind: 'error' }];

		const { lat: lt, lng: ln } = coords;
		const latOk = isValidLat(lt);
		const lngOk = isValidLng(ln);

		const segs: Segment[] = [];

		if (format === 'dms') {
			const ld = toDms(lt, 'lat');
			const nd = toDms(ln, 'lng');

			segs.push({ text: String(ld.d), kind: latOk ? 'lat-val' : 'error' });
			segs.push({ text: '°', kind: 'symbol' });
			segs.push({ text: String(ld.m).padStart(2, '0'), kind: 'lat-min' });
			segs.push({ text: "'", kind: 'symbol' });
			segs.push({ text: ld.s.toFixed(2).padStart(5, '0'), kind: 'lat-sec' });
			segs.push({ text: '"', kind: 'symbol' });
			segs.push({ text: ld.dir, kind: 'lat-dir' });

			segs.push({ text: ',  ', kind: 'sep' });

			segs.push({ text: String(nd.d), kind: lngOk ? 'lng-val' : 'error' });
			segs.push({ text: '°', kind: 'symbol' });
			segs.push({ text: String(nd.m).padStart(2, '0'), kind: 'lng-min' });
			segs.push({ text: "'", kind: 'symbol' });
			segs.push({ text: nd.s.toFixed(2).padStart(5, '0'), kind: 'lng-sec' });
			segs.push({ text: '"', kind: 'symbol' });
			segs.push({ text: nd.dir, kind: 'lng-dir' });
		} else {
			segs.push({ text: lt.toFixed(precision), kind: latOk ? 'lat-val' : 'error' });
			segs.push({ text: '°', kind: 'symbol' });
			segs.push({ text: ',  ', kind: 'sep' });
			segs.push({ text: ln.toFixed(precision), kind: lngOk ? 'lng-val' : 'error' });
			segs.push({ text: '°', kind: 'symbol' });
		}

		return segs;
	}

	const segments = $derived(buildSegments(value));
	const parsedCoords = $derived(parseCoords(value));
	const coordsValid = $derived(
		parsedCoords !== null && isValidLat(parsedCoords.lat) && isValidLng(parsedCoords.lng)
	);

	// Sync value → lat/lng props
	$effect(() => {
		const coords = parseCoords(value);
		if (coords && isValidLat(coords.lat) && isValidLng(coords.lng)) {
			lat = coords.lat;
			lng = coords.lng;
		} else if (!value.trim()) {
			lat = undefined;
			lng = undefined;
		}
	});

	// Sync lat/lng props → value string (external writes)
	$effect(() => {
		if (lat !== undefined && lng !== undefined) {
			const current = parseCoords(value);
			if (current?.lat !== lat || current?.lng !== lng) {
				value = `${lat}, ${lng}`;
				writeInputValue(bond, value);
			}
		}
	});

	// Geolocation
	function handleLocate() {
		if (!navigator?.geolocation || locating || disabled || readonly) return;
		locating = true;
		locationError = undefined;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				locating = false;
				const lt = parseFloat(pos.coords.latitude.toFixed(precision));
				const ln = parseFloat(pos.coords.longitude.toFixed(precision));
				lat = lt;
				lng = ln;
				value = `${lt}, ${ln}`;
				writeInputValue(bond, value);
				onchange?.(new Event('change'), { lat, lng, value });
			},
			(err) => {
				locating = false;
				locationError = err.message;
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	}

	// Input / change handlers
	function handleInput(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		value = input.value;
		writeInputValue(bond, value);
		syncScroll();
		oninput?.(ev, { lat, lng, value });
	}

	function handleChange(ev: Event) {
		onchange?.(ev, { lat, lng, value });
	}

	function syncScroll() {
		scrollLeft = inputEl?.scrollLeft ?? 0;
	}

	function handleFocus() {
		isFocused = true;
	}

	function handleBlur() {
		isFocused = false;
	}

	// Paste: normalise common coordinate formats
	function handlePaste(ev: ClipboardEvent) {
		ev.preventDefault();
		const pasted = ev.clipboardData?.getData('text') ?? '';
		const coords = parseCoords(pasted);
		if (coords) {
			value = `${coords.lat}, ${coords.lng}`;
		} else {
			value = pasted;
		}
		if (inputEl) inputEl.value = value;
		writeInputValue(bond, value);
		oninput?.(new Event('input'), { lat, lng, value });
	}
</script>

<span class="relative flex h-full w-full flex-1 items-center overflow-hidden">
	<!-- Display mode overlay (hidden while focused) -->
	{#if !isFocused}
		<span
			aria-hidden="true"
			class={cn(
				'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-2 font-mono text-sm',
				preset?.class,
				toClassValue(klass, bond)
			)}
		>
			<span style="transform: translateX(-{scrollLeft}px)">
				{#if segments.length}
					{#each segments as seg, i (i)}
						<span style={kindStyle[seg.kind]}>{seg.text}</span>
					{/each}
				{:else}
					<span class="text-muted-foreground">{placeholder}</span>
				{/if}
			</span>
		</span>
	{/if}

	<!-- Real <input> — transparent in display mode, visible while focused -->
	<input
		bind:this={inputEl}
		type="text"
		inputmode="decimal"
		autocomplete="off"
		spellcheck={false}
		bind:value
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			'relative h-full w-full flex-1 bg-transparent px-2 font-mono text-sm caret-foreground outline-none',
			isFocused
				? 'text-foreground placeholder:text-muted-foreground'
				: 'text-transparent placeholder:text-transparent',
			disabled && 'cursor-not-allowed opacity-50',
			preset?.class,
			toClassValue(klass, bond)
		)}
		oninput={handleInput}
		onchange={handleChange}
		onscroll={syncScroll}
		onpaste={handlePaste}
		onfocus={handleFocus}
		onblur={handleBlur}
		{...restProps}
	/>

	<!-- Locate-me button (Geolocation API) -->
	{#if locate && !readonly && !disabled}
		<button
			type="button"
			title={locating ? 'Locating…' : (locationError ?? 'Use current location')}
			aria-label="Use current location"
			class={cn(
				'mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded p-0.5 transition-colors',
				'text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1',
				locating && 'animate-pulse text-sky-500 dark:text-sky-400',
				locationError && !locating && 'text-destructive hover:text-destructive',
				coordsValid && !locating && !locationError && 'text-emerald-600 dark:text-emerald-400'
			)}
			onclick={handleLocate}
			tabindex={-1}
		>
			<!-- Crosshair icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="10" />
				<circle cx="12" cy="12" r="3" />
				<line x1="12" y1="2" x2="12" y2="5" />
				<line x1="12" y1="19" x2="12" y2="22" />
				<line x1="2" y1="12" x2="5" y2="12" />
				<line x1="19" y1="12" x2="22" y2="12" />
			</svg>
		</button>
	{/if}
</span>
