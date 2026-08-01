// UI-side filtering over a reactive source list — source is never mutated, `current` is a $derived view.
// createFilter: standalone (owns query). createBondFilter: spreads filter.props onto a list bond's Root.

// Text accessor (case-insensitive substring) or { match } predicate receiving the normalised query.
export type FilterMatcher<T> =
	| ((item: T) => string)
	| { match: (item: T, normalizedQuery: string) => boolean };

// The slice of a list bond the filter reads/writes: `keys` (universe) and reactive `query` (search text).
export interface KeyedListBond {
	state: { props: { keys?: string[]; query?: string } };
}

export interface Filter<T> {
	// Bindable search query.
	query: string;
	// $derived view over the source; empty query returns the source as-is (no allocation).
	readonly current: readonly T[];
	// Full ordered key universe from the source (ignoring query). Wire to a bond's `keys` prop.
	readonly keys: readonly string[];
	// Keys of the currently-matching items.
	readonly currentKeys: readonly string[];
	// Number of matching items.
	readonly count: number;
	// True when a non-whitespace query is active.
	readonly active: boolean;
	// True when a query is active but nothing matched.
	readonly empty: boolean;
	// Reset the query to empty.
	clear(): void;
}

// Filter bound to a list bond — same as Filter<T> plus `props` for bond wiring.
export interface BondFilter<T> extends Filter<T> {
	// Lifecycle props to spread onto a list bond's Root (`<Select.Root {...filter.props}>`).
	readonly props: Record<symbol, (bond: KeyedListBond) => void>;
}

export interface FilterOptions<T = unknown> {
	// Bind the query to external storage instead of owning it internally.
	query?: { get(): string; set(value: string): void };
	// Debounce ms between query change and current recomputing. Input stays instant.
	debounce?: number;
	// Initial query (when owned).
	initialQuery?: string;
	// Extract a stable item key — powers Filter.keys / Filter.currentKeys.
	key?: (item: T) => string;
}

// Single source of truth for the raw query text — resolved by both public factories before calling buildFilter.
interface QuerySource {
	get(): string;
	set(value: string): void;
}

// Bond-independent core: derives current/keys/currentKeys from data + matcher + a QuerySource.
// Query location and bond wiring are the caller's responsibility.
function buildFilter<T>(
	data: () => readonly T[],
	matcher: FilterMatcher<T>,
	options: FilterOptions<T>,
	source: QuerySource
): Filter<T> {
	// `applied` lags `query` by debounce ms so typing stays responsive; without debounce reads source directly.
	let applied = $state(source.get());
	let timer: ReturnType<typeof setTimeout> | undefined;

	const test =
		typeof matcher === 'function'
			? (item: T, q: string) => matcher(item).toLowerCase().includes(q)
			: (item: T, q: string) => matcher.match(item, q);

	const current = $derived.by(() => {
		const q = (options.debounce ? applied : source.get()).trim().toLowerCase();
		const all = data();
		return q ? all.filter((item) => test(item, q)) : all; // empty → passthrough, no alloc
	});

	const key = options.key;
	const keys = $derived(key ? data().map(key) : []);
	const currentKeys = $derived(key ? current.map(key) : []);

	return {
		get query() {
			return source.get();
		},
		set query(value: string) {
			source.set(value);
			if (options.debounce) {
				clearTimeout(timer);
				timer = setTimeout(() => (applied = value), options.debounce);
			}
		},
		get current() {
			return current;
		},
		get keys() {
			return keys;
		},
		get currentKeys() {
			return currentKeys;
		},
		get count() {
			return current.length;
		},
		get active() {
			return source.get().trim().length > 0;
		},
		get empty() {
			return this.active && current.length === 0;
		},
		clear() {
			this.query = '';
		}
	};
}

// Standalone filter — owns the query as $state or binds to options.query. Render filter.current yourself.
export function createFilter<T>(
	data: () => readonly T[],
	matcher: FilterMatcher<T>,
	options: FilterOptions<T> = {}
): Filter<T> {
	let owned = $state(options.initialQuery ?? '');
	const source: QuerySource = options.query ?? {
		get: () => owned,
		set: (value) => (owned = value)
	};
	return buildFilter(data, matcher, options, source);
}

// Bond-coupled filter — spread filter.props onto a list bond's Root. Query sources from bond's reactive `query` prop;
// key universe is pushed into bond's `keys` on init. Falls back to owned $state before bond arrives.
export function createBondFilter<T>(
	data: () => readonly T[],
	matcher: FilterMatcher<T>,
	options: FilterOptions<T> = {}
): BondFilter<T> {
	let owned = $state(options.initialQuery ?? '');

	// Bond captured via `props` init lifecycle — query lives in bond's reactive `query` prop when present.
	let boundBond = $state<KeyedListBond | undefined>(undefined);

	const source: QuerySource = options.query ?? {
		get: () => (boundBond ? (boundBond.state.props.query ?? '') : owned),
		set: (value) => {
			if (boundBond) {
				boundBond.state.props.query = value;
				return;
			}
			owned = value;
		}
	};

	const filter = buildFilter(data, matcher, options, source);

	// Stable lifecycle props for `<Select.Root {...filter.props}>`.
	// On init: captures bond (query→bond.query prop) and keeps bond.keys in sync with the key universe.
	// Uses the string-keyed `oninit` hook (the symbol `init` phase was dropped); the inner
	// `$effect.pre` is a no-op during SSR, so server-side it only captures the bond (harmless).
	const props: { oninit: (bond: KeyedListBond) => void } = {
		oninit: (bond) => {
			boundBond = bond;
			$effect.pre(() => {
				bond.state.props.keys = filter.keys as string[];
			});
		}
	};

	return Object.assign(filter, { props });
}
