import { describe, expect, it } from 'vitest';
import { StagedMap } from './staged-map.svelte';

const flushStagedWrites = () => new Promise<void>((resolve) => queueMicrotask(resolve));

describe('StagedMap<T>', () => {
	it('get() returns a pending restage before the microtask flush', async () => {
		const map = new StagedMap<string>();
		map.stage('a', 'first');
		await flushStagedWrites();

		map.stage('a', 'second');

		expect(map.get('a')).toBe('second');
	});

	it('find() treats a pending restage as authoritative before the microtask flush', async () => {
		const map = new StagedMap<string>();
		map.stage('a', 'first');
		await flushStagedWrites();

		map.stage('a', 'second');

		expect(map.find((value) => value === 'first')).toBeUndefined();
		expect(map.find((value) => value === 'second')).toBe('second');
	});

	it('forEach() visits each key once with the newest staged value', async () => {
		const map = new StagedMap<string>();
		map.stage('a', 'first');
		map.stage('b', 'stable');
		await flushStagedWrites();

		map.stage('a', 'second');

		const entries: Array<[string, string]> = [];
		map.forEach((key, value) => entries.push([key, value]));

		expect(entries).toEqual([
			['a', 'second'],
			['b', 'stable']
		]);
	});
});
