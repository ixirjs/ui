import type { FieldBond } from './field/bond.svelte';
import {
	bondContextKey,
	Bond,
	BondState,
	type BondStateProps
} from '$svelte-atoms/core/shared/bond.svelte';

export type FormProps<Extension extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		renderless?: boolean;
		validator?: unknown;
		extend: Extension;
		readonly rest?: Record<string, unknown>;
	};

export type FormElements = {
	root: HTMLElement;
};

export class FormBond extends Bond<FormProps, FormBondState> {
	static CONTEXT_KEY = bondContextKey('form');

	constructor(state: FormBondState) {
		super(state);
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
}

export class FormBondState<Props extends FormProps = FormProps> extends BondState<Props> {
	constructor(props: Props) {
		super(props);
	}

	mountField(id: string, atom: FieldBond) {
		// Collection.attach registers + returns the cleanup (see shared/collection.svelte.ts).
		return this.collection<FieldBond>('field').attach(id, atom);
	}

	unmountField(id: string) {
		this.collection<FieldBond>('field').delete(id);
	}

	validate() {
		this.fields.map((field) => field.state.validate());
	}

	clear() {}

	get fields() {
		return [...this.collection<FieldBond>('field').values];
	}
}
