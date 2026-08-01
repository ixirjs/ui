import type { FieldBond } from './field/bond.svelte';
import { bondContextKey, Bond, type BondStateProps } from '$svelte-atoms/core/shared/bond';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type FormProps<Extension extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		renderless?: boolean;
		validator?: unknown;
		extend: Extension;
	};

export type FormElements = {
	root: HTMLElement;
};

// -----------------------------------------------------------------------------
// Bond state
// -----------------------------------------------------------------------------

export class FormBond<Props extends FormProps = FormProps> extends Bond<Props> {
	static CONTEXT_KEY = bondContextKey('form');

	constructor(props: Props, name = 'form') {
		super(props, name);
	}

	root() {
		return {};
	}

	label() {
		return {};
	}

	control() {
		return {};
	}
	mountField(id: string, atom: FieldBond) {
		// Collection.set registers + returns the cleanup (see shared/bond/collection.svelte.ts).
		return this.collection<FieldBond>('field').set(id, atom);
	}

	unmountField(id: string) {
		this.collection<FieldBond>('field').delete(id);
	}

	validate() {
		this.fields.map((field) => field.validate());
	}

	clear() {}

	get fields() {
		return [...this.collection<FieldBond>('field').values];
	}
}
