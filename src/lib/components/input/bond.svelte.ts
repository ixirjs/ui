import { Bond, Atom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { createInput, defineBond, type BondOf, type InputModel } from '$svelte-atoms/core/shared';
import { SvelteDate } from 'svelte/reactivity';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type InputStateProps = BondStateProps & {
	value?: string | number | Date;
	readonly number?: number;
	readonly date?: Date;
	files?: File[];
	checked?: string[];
	group?: unknown[];
};

export type InputElements = {
	root: HTMLElement;
	input: HTMLInputElement;
	placeholder: HTMLElement;
};

// Input types whose value the bond coerces to Date; the element type disambiguates ambiguous strings.
const DATE_INPUT_TYPES = ['date', 'time', 'datetime-local', 'month', 'week'];

// Bond shape input atoms type against — breaks the atom↔bond cycle.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type InputBondView = InputBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class InputRootAtom extends Atom<InputBondView> {
	constructor(bond: InputBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'group'
		};
	}
}

export class InputControlAtom extends Atom<InputBondView, HTMLInputElement> {
	#type = $state<string>();

	constructor(bond: InputBondView) {
		// Named `control` (not `input`) to avoid the redundant `input-input-*` id prefix.
		super(bond, 'control');
	}

	get type() {
		return this.#type;
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'group'
		};
	}

	override onmount(node: HTMLInputElement) {
		const cleanup = super.onmount(node);

		this.#type = node.type;

		return cleanup;
	}
}

export class InputPlaceholderAtom extends Atom<InputBondView> {
	constructor(bond: InputBondView) {
		super(bond, 'placeholder');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'group'
		};
	}
}

// Hand-written base for InputBond — holds value-coercion getters that read the value model
// and the live element `type` (via the `input` atom). `defineBond` extends this.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class InputBondBase extends Bond<InputStateProps> {
	// InputModel backed by the bindable `value` prop; typed coercions (number/date/files) stay on props.
	readonly value: InputModel = createInput({
		value: {
			get: () => (this.props.value == null ? '' : String(this.props.value)),
			set: (value) => (this.props.value = value)
		}
	});

	constructor(props: InputStateProps, name = 'input') {
		super(props, name);
	}

	// get/set map to the bindable `value` prop.
	// Value coerced to number; undefined if the element type isn't 'number' or value isn't finite.
	get number(): number | undefined {
		if ((this.node('input') as InputControlAtom | undefined)?.type !== 'number') return undefined;

		const raw = this.value.get();
		if (raw.trim() === '') return undefined;

		const n = Number(raw);
		return Number.isFinite(n) ? n : undefined;
	}

	// Value coerced to Date; undefined if not a date-like input type or value doesn't parse.
	get date(): Date | undefined {
		const control = this.node('input') as InputControlAtom | undefined;
		if (!control?.type || !DATE_INPUT_TYPES.includes(control.type)) return undefined;

		const raw = this.value.get();
		if (raw.trim() === '') return undefined;

		// Date.parse covers date/datetime-local/month; fall back to valueAsDate for time/week.
		const parsed = Date.parse(raw);
		if (!Number.isNaN(parsed)) return new SvelteDate(parsed);

		const fromInput = control.element?.valueAsDate;
		return fromInput ? new SvelteDate(fromInput) : undefined;
	}

	get files() {
		return this.state.props.files ?? [];
	}
}

// InputBond via defineBond over InputBondBase; the `input` atom's live type drives number/date coercion.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const InputBondImpl = defineBond<
	{
		root: typeof InputRootAtom;
		input: typeof InputControlAtom;
		placeholder: typeof InputPlaceholderAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof InputBondBase
>({
	name: 'input',
	base: InputBondBase,
	atoms: {
		root: InputRootAtom,
		input: InputControlAtom,
		placeholder: InputPlaceholderAtom
	}
});

// Instance type of the input bond — paired with the const above.
export type InputBond = BondOf<typeof InputBondImpl>;

interface InputBondConstructor {
	new (props: InputStateProps): InputBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof InputBondImpl)['spec'];
	get(): InputBond | undefined;
	getOrThrow(message?: string): InputBond;
	set(bond: InputBond): InputBond;
	create(props: InputStateProps): InputBond;
}

export const InputBond = InputBondImpl as unknown as InputBondConstructor;
