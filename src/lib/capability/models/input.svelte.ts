export interface InputField {
	get(): string;
	set(value: string): void;
}

// The first key is the primary field. Owns no state — consumers supply the backing stores.
export interface InputModel {
	// A field's text (the primary field when `field` is omitted). Reactive.
	get(field?: string): string;
	// Write a field's text (the primary field when omitted).
	set(value: string, field?: string): void;
	// Clear a field (primary when omitted). Returns `true` when it had text to clear.
	clear(field?: string): boolean;
}

export function createInput(fields: Record<string, InputField>): InputModel {
	const primary = Object.keys(fields)[0]!;
	const pick = (field?: string): InputField | undefined => {
		const key = field ?? primary;
		return Object.hasOwn(fields, key) ? fields[key] : undefined;
	};
	return {
		get: (field) => pick(field)?.get() ?? '',
		set: (value, field) => pick(field)?.set(value),
		clear: (field) => {
			const f = pick(field);
			if (!f || !f.get()) return false;
			f.set('');
			return true;
		}
	};
}
