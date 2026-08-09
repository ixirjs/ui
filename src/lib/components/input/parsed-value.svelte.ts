import { untrack } from 'svelte';

export type ParseResult<Value> = { value: Value } | undefined;

interface ParsedValueOptions<Raw, Parsed> {
	raw: { get(): Raw; set(value: Raw): void };
	parsed: { get(): Parsed; set(value: Parsed): void };
	parse(raw: Raw): ParseResult<Parsed>;
	format(parsed: Parsed): Raw;
	preferRaw?: (raw: Raw) => boolean;
	equalsRaw?: (left: Raw, right: Raw) => boolean;
	equalsParsed?: (left: Parsed, right: Parsed) => boolean;
	onRawChange?: (raw: Raw) => void;
}

/**
 * Keeps a public raw value and its parsed projection synchronized.
 *
 * Raw wins when both are changed in the same turn. On initialization a non-empty raw value wins;
 * otherwise the parsed projection seeds raw. Invalid, incomplete raw input intentionally leaves the
 * last valid parsed projection alone.
 */
export function createParsedValue<Raw, Parsed>(options: ParsedValueOptions<Raw, Parsed>) {
	const equalRaw = options.equalsRaw ?? Object.is;
	const equalParsed = options.equalsParsed ?? Object.is;
	const preferRaw = options.preferRaw ?? (() => true);

	let previousRaw = untrack(options.raw.get);
	let previousParsed = untrack(options.parsed.get);

	function adoptRaw(raw: Raw) {
		const result = options.parse(raw);
		if (result && !equalParsed(options.parsed.get(), result.value)) {
			options.parsed.set(result.value);
		}
		options.onRawChange?.(raw);
	}

	function adoptParsed(parsed: Parsed) {
		const raw = options.format(parsed);
		if (equalRaw(options.raw.get(), raw)) return;
		options.raw.set(raw);
		options.onRawChange?.(raw);
	}

	if (preferRaw(previousRaw)) adoptRaw(previousRaw);
	else adoptParsed(previousParsed);

	previousRaw = untrack(options.raw.get);
	previousParsed = untrack(options.parsed.get);

	$effect(() => {
		const raw = options.raw.get();
		const parsed = options.parsed.get();
		const rawChanged = !equalRaw(raw, previousRaw);
		const parsedChanged = !equalParsed(parsed, previousParsed);

		untrack(() => {
			if (rawChanged) adoptRaw(raw);
			else if (parsedChanged) adoptParsed(parsed);

			previousRaw = options.raw.get();
			previousParsed = options.parsed.get();
		});
	});

	return {
		setRaw(raw: Raw) {
			options.raw.set(raw);
			adoptRaw(raw);
		},
		setParsed(parsed: Parsed) {
			options.parsed.set(parsed);
			adoptParsed(parsed);
		}
	};
}
