import { describe, expect, it } from 'vitest';
import { parseEmailSegments, parseUrlSegments, partialUrlSegments } from './segments';

const text = (segs: { text: string }[]) => segs.map((s) => s.text).join('');
const kinds = (segs: { kind: string }[]) => segs.map((s) => s.kind);

describe('parseEmailSegments', () => {
	it('splits an address into local, @, domain and TLD', () => {
		const segs = parseEmailSegments('ada@example.com');

		expect(kinds(segs)).toEqual(['local', 'at', 'domain', 'tld']);
		expect(segs.map((s) => s.text)).toEqual(['ada', '@', 'example', '.com']);
	});

	it('treats text with no @ as one plain run', () => {
		expect(parseEmailSegments('ada')).toEqual([{ text: 'ada', kind: 'plain' }]);
	});

	it('emits the @ while the address is still half-typed', () => {
		expect(kinds(parseEmailSegments('ada@'))).toEqual(['local', 'at']);
		expect(kinds(parseEmailSegments('@example.com'))).toEqual(['at', 'domain', 'tld']);
	});

	it('splits on the last dot, so a multi-label domain keeps its TLD', () => {
		const segs = parseEmailSegments('ada@mail.example.co.uk');

		expect(segs.at(-2)).toEqual({ text: 'mail.example.co', kind: 'domain' });
		expect(segs.at(-1)).toEqual({ text: '.uk', kind: 'tld' });
	});

	it('does not call a trailing dot a TLD', () => {
		expect(kinds(parseEmailSegments('ada@example.'))).toEqual(['local', 'at', 'domain']);
	});

	it('returns nothing for an empty value', () => {
		expect(parseEmailSegments('')).toEqual([]);
	});
});

describe('parseUrlSegments', () => {
	it('splits a full URL into every part', () => {
		const segs = parseUrlSegments('https://example.com:8080/a/b?q=1#top');

		expect(kinds(segs)).toEqual(['protocol', 'host', 'port', 'pathname', 'search', 'hash']);
		expect(text(segs)).toBe('https://example.com:8080/a/b?q=1#top');
	});

	it('omits the protocol segment when the value has none', () => {
		const segs = parseUrlSegments('example.com/a');

		expect(kinds(segs)).toEqual(['host', 'pathname']);
		expect(text(segs)).toBe('example.com/a');
	});

	it('drops a bare root path but keeps it when a query or hash follows', () => {
		expect(kinds(parseUrlSegments('example.com/'))).toEqual(['host']);
		expect(kinds(parseUrlSegments('example.com/?q=1'))).toEqual(['host', 'pathname', 'search']);
	});

	it('folds credentials into a single plain run', () => {
		const segs = parseUrlSegments('https://ada:pw@example.com');

		expect(segs[1]).toEqual({ text: 'ada:pw@', kind: 'plain' });
	});

	it('returns nothing for an empty value', () => {
		expect(parseUrlSegments('')).toEqual([]);
	});
});

// The field colours as you type, so most of what this parser sees is not yet a URL.
describe('partialUrlSegments — half-typed input', () => {
	it('covers the whole input, losing no characters', () => {
		for (const raw of [
			'ht',
			'https://',
			'https://exa',
			'example.com:80',
			'example.com/a?q',
			'example.com#f',
			'/just/a/path'
		]) {
			expect(text(partialUrlSegments(raw)), raw).toBe(raw);
		}
	});

	it('reads a protocol on its own', () => {
		expect(partialUrlSegments('https://')).toEqual([{ text: 'https://', kind: 'protocol' }]);
	});

	it('treats a bare word as a host', () => {
		expect(partialUrlSegments('example.com')).toEqual([{ text: 'example.com', kind: 'host' }]);
	});

	it('separates a port from the host', () => {
		expect(kinds(partialUrlSegments('example.com:8080/a'))).toEqual(['host', 'port', 'pathname']);
	});

	it('splits query and hash when both are present', () => {
		const segs = partialUrlSegments('example.com/a?q=1#top');

		expect(kinds(segs)).toEqual(['host', 'pathname', 'search', 'hash']);
		expect(segs.at(-2)?.text).toBe('?q=1');
		expect(segs.at(-1)?.text).toBe('#top');
	});

	it('handles a hash with no query', () => {
		expect(kinds(partialUrlSegments('example.com/a#top'))).toEqual(['host', 'pathname', 'hash']);
	});
});
