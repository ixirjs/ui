/**
 * Input's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same names and surface as before (`{ input }` in snippets, `getBond`, `factory`,
 * `InputBond.create`, the `value` InputModel, `number`/`date`/`files`), none of the runtime: no
 * Atoms, no capability registry, no node registry. The one fact a control used to register — its
 * semantic type, which `number`/`date`/`shouldShowPlaceholder` gate on — is declared into one
 * `$state` field at the control's init (`useControl`'s `type` option).
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { createInput, type InputModel } from '$ixirjs/ui/capability/models/input.svelte';
import { SvelteDate } from 'svelte/reactivity';

export type InputStateProps = {
	id?: string;
	value?: string | number | Date | undefined;
	readonly number?: number;
	readonly date?: Date;
	files?: File[] | undefined;
	checked?: boolean | undefined;
	group?: unknown[];
};

// Input types whose value the bond coerces to Date; the element type disambiguates ambiguous strings.
export const DATE_INPUT_TYPES = ['date', 'time', 'datetime-local', 'month', 'week'];

export const InputContext = Kernel.context<InputBond>('bond/input');

export class InputBond {
	static readonly CONTEXT_KEY = InputContext.key;
	static get(): InputBond | undefined {
		return InputContext.get();
	}
	static getOrThrow(message?: string): InputBond {
		return InputContext.getOrThrow(message);
	}
	static create(props: InputStateProps = {}): InputBond {
		return new InputBond(props);
	}

	readonly name = 'input';
	readonly props: InputStateProps;

	// The registered control's semantic type, as a reactive accessor: `datetime-control` switches
	// type with its `mode` prop, and a plain `<input>` control reports the type it renders.
	#type = $state.raw<() => string | undefined>();

	// The last date the control parsed out of its element (`input.valueAsDate`), for the types
	// Date.parse cannot read back from the raw string — time and week.
	#valueAsDate = $state.raw<Date | null>(null);

	// InputModel backed by the bindable `value` prop; typed coercions (number/date/files) stay on props.
	readonly value: InputModel = createInput({
		value: {
			get: () => (this.props.value == null ? '' : String(this.props.value)),
			set: (value) => this.setValue(value)
		}
	});

	constructor(props: InputStateProps = {}) {
		this.props = props;
	}

	/** The family's identity seed — the root's `$props.id()`. */
	get id(): string {
		return this.props.id ?? 'input';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'input-root');
	}
	// Named `control` (not `input`) to avoid the redundant `input-input-*` id prefix.
	get controlId(): string {
		return Kernel.id(this.id, 'input-control');
	}
	get placeholderId(): string {
		return Kernel.id(this.id, 'input-placeholder');
	}

	/** @internal The control declares its semantic type at init. */
	declareType(type: () => string | undefined): void {
		this.#type = type;
	}

	/** @internal The control reports its element's parsed date on input. */
	declareDate(date: Date | null): void {
		this.#valueAsDate = date;
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
		return this.#type?.();
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
		if (!this.controlType || !DATE_INPUT_TYPES.includes(this.controlType)) return undefined;

		const raw = this.value.get();
		if (raw.trim() === '') return undefined;

		// Date.parse covers date/datetime-local/month; time/week fall back to the date the control
		// declared from its element's `valueAsDate`.
		const parsed = Date.parse(raw);
		if (!Number.isNaN(parsed)) return new SvelteDate(parsed);

		return this.#valueAsDate ? new SvelteDate(this.#valueAsDate) : undefined;
	}

	get files() {
		return this.props.files ?? [];
	}
}
