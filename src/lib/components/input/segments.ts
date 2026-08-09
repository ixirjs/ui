// Segment parsers for the colour-overlay text controls. Pure string → segment-list functions,
// extracted from their components for the same reason phone-mask.ts and location.ts were: this is
// where the actual logic lives, and inside a .svelte file none of it is reachable from a test.
// The components keep only their per-kind colour maps.

export type EmailSegmentKind = 'local' | 'at' | 'domain' | 'tld' | 'plain';
export type UrlSegmentKind =
	| 'protocol'
	| 'host'
	| 'port'
	| 'pathname'
	| 'search'
	| 'hash'
	| 'plain';

export interface Segment<Kind extends string> {
	text: string;
	kind: Kind;
}

/** Splits an address into local / @ / domain / TLD. Text with no `@` is one plain run. */
export function parseEmailSegments(raw: string): Segment<EmailSegmentKind>[] {
	if (!raw) return [];

	const atIdx = raw.indexOf('@');
	if (atIdx === -1) return [{ text: raw, kind: 'plain' }];

	const local = raw.slice(0, atIdx);
	const domain = raw.slice(atIdx + 1);
	const segs: Segment<EmailSegmentKind>[] = [];

	if (local) segs.push({ text: local, kind: 'local' });
	segs.push({ text: '@', kind: 'at' });

	if (domain) {
		// Split domain into base + TLD on the last dot.
		const lastDot = domain.lastIndexOf('.');
		if (lastDot !== -1 && lastDot < domain.length - 1) {
			segs.push({ text: domain.slice(0, lastDot), kind: 'domain' });
			segs.push({ text: domain.slice(lastDot), kind: 'tld' });
		} else {
			segs.push({ text: domain, kind: 'domain' });
		}
	}

	return segs;
}

/**
 * Splits a URL into its parts. Parsed with `URL` when it can be, which is why a value with no
 * protocol is parsed against a fake `https://` prefix that is then not emitted as a segment.
 *
 * Half-typed input is the normal case here — the field colours as you type — so anything `URL`
 * rejects falls through to `partialUrlSegments`.
 */
export function parseUrlSegments(raw: string): Segment<UrlSegmentKind>[] {
	if (!raw) return [];

	const hasProtocol = /^[a-z][a-z0-9+\-.]*:\/\//i.test(raw);
	const forParsing = hasProtocol ? raw : 'https://' + raw;

	try {
		const u = new URL(forParsing);
		const segs: Segment<UrlSegmentKind>[] = [];

		if (hasProtocol) {
			segs.push({ text: u.protocol + '//', kind: 'protocol' });
		}

		if (u.username) {
			segs.push({ text: u.username + (u.password ? ':' + u.password : '') + '@', kind: 'plain' });
		}

		segs.push({ text: u.hostname, kind: 'host' });

		if (u.port) {
			segs.push({ text: ':' + u.port, kind: 'port' });
		}

		if (u.pathname && u.pathname !== '/') {
			segs.push({ text: u.pathname, kind: 'pathname' });
		} else if (u.pathname === '/' && (u.search || u.hash)) {
			segs.push({ text: '/', kind: 'pathname' });
		}

		if (u.search) {
			segs.push({ text: u.search, kind: 'search' });
		}

		if (u.hash) {
			segs.push({ text: u.hash, kind: 'hash' });
		}

		return segs;
	} catch {
		// Not yet a valid URL — fall back to partial segment detection.
		return partialUrlSegments(raw);
	}
}

/** Best-effort split for a URL `URL` won't accept yet. Exported for its own tests. */
export function partialUrlSegments(raw: string): Segment<UrlSegmentKind>[] {
	const segs: Segment<UrlSegmentKind>[] = [];
	let rest = raw;

	const protoMatch = rest.match(/^([a-z][a-z0-9+\-.]*:\/\/)/i);
	if (protoMatch) {
		// Group 1 is required by the regex, so it's present when protoMatch matched.
		segs.push({ text: protoMatch[1]!, kind: 'protocol' });
		rest = rest.slice(protoMatch[1]!.length);
	}

	if (!rest) return segs;

	// Split host from the rest at the first / ? or #
	const sep = rest.search(/[/?#]/);
	if (sep === -1) {
		segs.push({ text: rest, kind: 'host' });
		return segs;
	}

	const hostPart = rest.slice(0, sep);
	const afterHost = rest.slice(sep);

	const portMatch = hostPart.match(/^(.*):(\d+)$/);
	if (portMatch) {
		if (portMatch[1]) segs.push({ text: portMatch[1], kind: 'host' });
		segs.push({ text: ':' + portMatch[2], kind: 'port' });
	} else {
		if (hostPart) segs.push({ text: hostPart, kind: 'host' });
	}

	const hashIdx = afterHost.indexOf('#');
	const searchIdx = afterHost.indexOf('?');

	if (searchIdx !== -1) {
		const path = afterHost.slice(0, searchIdx);
		const queryAndHash = afterHost.slice(searchIdx);
		const hashInQuery = queryAndHash.indexOf('#');
		if (path) segs.push({ text: path, kind: 'pathname' });
		if (hashInQuery !== -1) {
			segs.push({ text: queryAndHash.slice(0, hashInQuery), kind: 'search' });
			segs.push({ text: queryAndHash.slice(hashInQuery), kind: 'hash' });
		} else {
			segs.push({ text: queryAndHash, kind: 'search' });
		}
	} else if (hashIdx !== -1) {
		const path = afterHost.slice(0, hashIdx);
		if (path) segs.push({ text: path, kind: 'pathname' });
		segs.push({ text: afterHost.slice(hashIdx), kind: 'hash' });
	} else {
		segs.push({ text: afterHost, kind: 'pathname' });
	}

	return segs;
}
