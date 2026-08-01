export type ParsedLocationCoords = { lat: number; lng: number } | null;
export type LocationFormat = 'dd' | 'dms';

export type LocationSegmentKind =
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

export type LocationSegment = { text: string; kind: LocationSegmentKind };

export const LOCATION_SEGMENT_STYLES: Record<LocationSegmentKind, string> = {
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

export function parseLocationCoords(raw: string): ParsedLocationCoords {
	if (!raw.trim()) return null;

	const clean = raw.replace(/[\u00b0'"]/g, ' ').trim();
	const parts = clean.split(/[\s,;]+/).filter(Boolean);
	if (parts.length < 2) return null;

	const lat = parseLocationPart(parts[0]!);
	const lng = parseLocationPart(parts[1]!);
	if (lat === null || lng === null) return null;
	return { lat, lng };
}

export function isValidLatitude(value: number): boolean {
	return value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
	return value >= -180 && value <= 180;
}

export function locationCoordsValid(coords: ParsedLocationCoords): boolean {
	return coords !== null && isValidLatitude(coords.lat) && isValidLongitude(coords.lng);
}

export function buildLocationSegments(
	raw: string,
	options: { format?: LocationFormat; precision?: number } = {}
): LocationSegment[] {
	if (!raw.trim()) return [];

	const coords = parseLocationCoords(raw);
	if (!coords) return [{ text: raw, kind: 'error' }];

	const format = options.format ?? 'dd';
	const precision = options.precision ?? 6;
	const latOk = isValidLatitude(coords.lat);
	const lngOk = isValidLongitude(coords.lng);

	if (format === 'dms') {
		return buildDmsSegments(coords.lat, coords.lng, latOk, lngOk);
	}

	return [
		{ text: coords.lat.toFixed(precision), kind: latOk ? 'lat-val' : 'error' },
		{ text: '\u00b0', kind: 'symbol' },
		{ text: ',  ', kind: 'sep' },
		{ text: coords.lng.toFixed(precision), kind: lngOk ? 'lng-val' : 'error' },
		{ text: '\u00b0', kind: 'symbol' }
	];
}

function parseLocationPart(value: string): number | null {
	const dir = /[NSEWnsew]$/.exec(value)?.[0]?.toUpperCase();
	const numeric = parseFloat(value.replace(/[NSEWnsew]$/i, ''));
	if (isNaN(numeric)) return null;
	if (dir === 'S' || dir === 'W') return -numeric;
	return numeric;
}

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

function buildDmsSegments(
	lat: number,
	lng: number,
	latOk: boolean,
	lngOk: boolean
): LocationSegment[] {
	const latDms = toDms(lat, 'lat');
	const lngDms = toDms(lng, 'lng');

	return [
		{ text: String(latDms.d), kind: latOk ? 'lat-val' : 'error' },
		{ text: '\u00b0', kind: 'symbol' },
		{ text: String(latDms.m).padStart(2, '0'), kind: 'lat-min' },
		{ text: "'", kind: 'symbol' },
		{ text: latDms.s.toFixed(2).padStart(5, '0'), kind: 'lat-sec' },
		{ text: '"', kind: 'symbol' },
		{ text: latDms.dir, kind: 'lat-dir' },
		{ text: ',  ', kind: 'sep' },
		{ text: String(lngDms.d), kind: lngOk ? 'lng-val' : 'error' },
		{ text: '\u00b0', kind: 'symbol' },
		{ text: String(lngDms.m).padStart(2, '0'), kind: 'lng-min' },
		{ text: "'", kind: 'symbol' },
		{ text: lngDms.s.toFixed(2).padStart(5, '0'), kind: 'lng-sec' },
		{ text: '"', kind: 'symbol' },
		{ text: lngDms.dir, kind: 'lng-dir' }
	];
}
