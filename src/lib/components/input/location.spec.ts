import { describe, expect, it } from 'vitest';
import {
	buildLocationSegments,
	isValidLatitude,
	isValidLongitude,
	locationCoordsValid,
	parseLocationCoords
} from '$ixirjs/ui/components/input/location';

describe('location input helpers', () => {
	it('parses decimal coordinates with separators and direction suffixes', () => {
		expect(parseLocationCoords('40.7128N, 74.0060W')).toEqual({
			lat: 40.7128,
			lng: -74.006
		});
		expect(parseLocationCoords('40.7128; -74.0060')).toEqual({
			lat: 40.7128,
			lng: -74.006
		});
		expect(parseLocationCoords('')).toBeNull();
	});

	it('validates latitude and longitude ranges separately', () => {
		expect(isValidLatitude(90)).toBe(true);
		expect(isValidLatitude(91)).toBe(false);
		expect(isValidLongitude(180)).toBe(true);
		expect(isValidLongitude(-181)).toBe(false);
		expect(locationCoordsValid({ lat: 40, lng: -74 })).toBe(true);
		expect(locationCoordsValid({ lat: 95, lng: -74 })).toBe(false);
	});

	it('builds decimal-degree overlay segments with configured precision', () => {
		expect(buildLocationSegments('40.7128, -74.0060', { precision: 2 })).toEqual([
			{ text: '40.71', kind: 'lat-val' },
			{ text: '\u00b0', kind: 'symbol' },
			{ text: ',  ', kind: 'sep' },
			{ text: '-74.01', kind: 'lng-val' },
			{ text: '\u00b0', kind: 'symbol' }
		]);
	});

	it('marks invalid parsed ranges without rejecting the whole segment list', () => {
		expect(buildLocationSegments('95, -181').map((segment) => segment.kind)).toEqual([
			'error',
			'symbol',
			'sep',
			'error',
			'symbol'
		]);
		expect(buildLocationSegments('not coordinates')).toEqual([
			{ text: 'not coordinates', kind: 'error' }
		]);
	});

	it('builds DMS overlay segments with hemisphere directions', () => {
		expect(buildLocationSegments('40.5, -73.25', { format: 'dms' })).toEqual([
			{ text: '40', kind: 'lat-val' },
			{ text: '\u00b0', kind: 'symbol' },
			{ text: '30', kind: 'lat-min' },
			{ text: "'", kind: 'symbol' },
			{ text: '00.00', kind: 'lat-sec' },
			{ text: '"', kind: 'symbol' },
			{ text: 'N', kind: 'lat-dir' },
			{ text: ',  ', kind: 'sep' },
			{ text: '73', kind: 'lng-val' },
			{ text: '\u00b0', kind: 'symbol' },
			{ text: '15', kind: 'lng-min' },
			{ text: "'", kind: 'symbol' },
			{ text: '00.00', kind: 'lng-sec' },
			{ text: '"', kind: 'symbol' },
			{ text: 'W', kind: 'lng-dir' }
		]);
	});
});
