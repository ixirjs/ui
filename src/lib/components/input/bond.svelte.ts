import { Bond, Atom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { createInput, defineBond, type BondOf, type InputModel } from '$ixirjs/ui/shared';
import { SvelteDate } from 'svelte/reactivity';

export type InputStateProps = BondStateProps & {
	value?: string | number | Date | undefined;
	readonly number?: number;
	readonly date?: Date;
	files?: File[];
	checked?: boolean;
	group?: unknown[];
};

// Input types whose value the bond coerces to Date; the element type disambiguates ambiguous strings.
export const DATE_INPUT_TYPES = ['date', 'time', 'datetime-local', 'month', 'week'];

// Bond shape input atoms type against — breaks the atom↔bond cycle.

class InputRootAtom extends Atom<InputBondBase> {
	constructor(bond: InputBondBase) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'group'
		};
	}
}

export class InputControlAtom extends Atom<InputBondBase, HTMLElement> {
	#domType = $state<string>();
	#declaredType = $state<() => string | undefined>();

	constructor(bond?: InputBondBase) {
		// Named `control` (not `input`) to avoid the redundant `input-input-*` id prefix.
		super(bond, 'control', { namespace: 'input' });
	}

	/**
	 * The control's semantic input type, which `bond.number` and `bond.date` gate on.
	 *
	 * A control that renders a real `<input>` gets this for free from the mounted element. The
	 * segment-based controls (time, datetime, color) render spans, so the DOM has no type to read
	 * and they declare theirs instead — without that, `bond.date` was permanently `undefined` for
	 * exactly the controls that produce dates.
	 */
	get type() {
		return this.#declaredType?.() ?? this.#domType;
	}

	/** Reactive accessor, not a value: `datetime-control` switches type with its `mode` prop. */
	declareType(type: () => string | undefined) {
		this.#declaredType = type;
	}

	override onmount(node: HTMLElement) {
		const cleanup = super.onmount(node);

		this.#domType = node instanceof HTMLInputElement ? node.type : undefined;

		return cleanup;
	}
}

class InputPlaceholderAtom extends Atom<InputBondBase> {
	constructor(bond?: InputBondBase) {
		super(bond, 'placeholder', { namespace: 'input' });
	}
}

// Hand-written base for InputBond — holds value-coercion getters that read the value model
// and the live element `type` (via the `input` atom). `defineBond` extends this.

class InputBondBase extends Bond<InputStateProps> {
	// InputModel backed by the bindable `value` prop; typed coercions (number/date/files) stay on props.
	readonly value: InputModel = createInput({
		value: {
			get: () => (this.props.value == null ? '' : String(this.props.value)),
			set: (value) => this.setValue(value)
		}
	});

	constructor(props: InputStateProps, name = 'input') {
		super(props, name);
	}

	setValue(value: InputStateProps['value']) {
		this.props.value = value;
	}

	setFiles(files: File[]) {
		this.props.files = files;
	}

	setChecked(checked: boolean) {
		this.props.checked = checked;
	}

	get controlType() {
		return (this.nodeByPart('input') as InputControlAtom | undefined)?.type;
	}

	get shouldShowPlaceholder() {
		if (this.controlType === 'radio' || this.controlType === 'checkbox') return false;
		if (this.controlType === 'file') return this.files.length === 0;
		return !this.props.value;
	}

	// Value coerced to number; undefined if the element type isn't 'number' or value isn't finite.
	get number(): number | undefined {
		if (this.controlType !== 'number') return undefined;

		const raw = this.value.get();
		if (raw.trim() === '') return undefined;

		const n = Number(raw);
		return Number.isFinite(n) ? n : undefined;
	}

	// Value coerced to Date; undefined if not a date-like input type or value doesn't parse.
	get date(): Date | undefined {
		const control = this.nodeByPart('input') as InputControlAtom | undefined;
		if (!this.controlType || !DATE_INPUT_TYPES.includes(this.controlType)) return undefined;

		const raw = this.value.get();
		if (raw.trim() === '') return undefined;

		// Date.parse covers date/datetime-local/month; fall back to valueAsDate for time/week.
		const parsed = Date.parse(raw);
		if (!Number.isNaN(parsed)) return new SvelteDate(parsed);

		const element = control?.element;
		const fromInput =
			element?.tagName === 'INPUT' ? (element as HTMLInputElement).valueAsDate : null;
		return fromInput ? new SvelteDate(fromInput) : undefined;
	}

	get files() {
		return this.props.files ?? [];
	}
}

// InputBond via defineBond over InputBondBase; the `input` atom's live type drives number/date coercion.

export const InputBond = defineBond({
	name: 'input',
	base: InputBondBase,
	atoms: {
		root: InputRootAtom,
		input: InputControlAtom,
		placeholder: InputPlaceholderAtom
	}
});

// Instance type of the input bond — paired with the const above.
export type InputBond = BondOf<typeof InputBond>;
