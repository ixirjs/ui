import type { Snippet } from 'svelte';
import type { EventHandler, HTMLAttributes } from 'svelte/elements';
import type { RenderProps, Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { Factory, Override, StateChangeCallback } from '$ixirjs/ui/types';
import type { ValidationError } from '$ixirjs/ui/capability/models/validation.svelte';
import type { ErrorRecord, StandardSchemaV1, ValidationSource } from '$ixirjs/ui/validation';
import type { FormBond, ValidationMode } from './bond.svelte';
import type { FieldBond, FieldStateProps } from './field/bond.svelte';

type SnippetProps = Record<string, unknown>;

// Snippet props

export interface FormSnippetProps extends SnippetProps {
	form: FormBond;
}

export type FormChildren = Snippet<[FormSnippetProps]>;

export interface FieldSnippetProps extends SnippetProps {
	field: FieldBond | undefined;
}

export type FieldChildren = Snippet<[FieldSnippetProps]>;

// Extension point: merge custom props into Form.Root by augmenting this interface. The Field
// parts are interface-shaped, so they are augmented directly instead.
export interface FormRootExtendProps {}

/** Reported after every validation run, not only on submit. */
export interface FormValidateDetails {
	values: Record<string, unknown>;
	errors: readonly ValidationError[];
	valid: boolean;
	trigger: 'submit';
}

interface FormCommonProps {
	/** Replaces the Bond constructor, so a family can be extended or fused. */
	factory?: Factory<FormBond>;
	/**
	 * Any [Standard Schema](https://standardschema.dev) — Zod, Valibot, ArkType, Effect. No adapter,
	 * no wrapper: pass the schema itself. Errors are routed to fields by matching the issue path
	 * against each field's `name`.
	 */
	schema?: StandardSchemaV1 | undefined;
	/** A validation source for state this form does not own — see `superformsSource`. */
	source?: ValidationSource | undefined;
	/** An externally owned error bag, flat or nested. Superforms' `$errors` fits as-is. */
	errors?: ErrorRecord | undefined;
	/** When fields re-check themselves. Defaults to `'touched'`. */
	mode?: ValidationMode | undefined;
	/**
	 * Call `preventDefault()` on an invalid submit. Off by default: the form validates and populates
	 * errors but still submits, which is what keeps a no-JS/progressively-enhanced form working.
	 */
	blockInvalidSubmit?: boolean | undefined;
	/** Fires after a submit-triggered validation run, with the aggregate result. */
	onvalidate?: ((details: FormValidateDetails) => void) | undefined;
	/**
	 * Native submit handler, forwarded unchanged. It runs *after* validation, so the bond it can
	 * reach already holds this submit's errors.
	 */
	onsubmit?: EventHandler<SubmitEvent, HTMLFormElement> | null;
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: RenderProps<'form'>['preset'];
}

type FormRenderlessProps = {
	/** Renders no `<form>` element of its own, so the Bond can wrap markup a parent already owns. */
	renderless?: true;
	/** Additional CSS classes to apply */
	class?: never;
	/** Form content */
	children?: FormChildren;
};

type FormRenderfullProps<B extends Base = Base> = Override<
	RenderProps<'form', B, FormChildren>,
	{
		/** Renders a real `<form>` element. The default. */
		renderless?: false;
		/** Content of this part. */
		children?: FormChildren;
	}
> &
	HTMLAttributes<HTMLFormElement>;

export type FormRootProps<B extends Base = Base> = FormCommonProps &
	FormRootExtendProps &
	(FormRenderlessProps | FormRenderfullProps<B>);

export interface FieldRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, FieldChildren> {
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Renders the current value but blocks editing. Unlike `disabled`, it stays focusable. */
	readonly?: boolean;
	/** Marks the control as required, projecting `aria-required` onto it. */
	required?: boolean;
	/** Field name for form data */
	name?: string;
	/** Field value */
	value?: unknown;
	/** A Standard Schema checked against this field's value alone, independent of the form’s. */
	schema?: StandardSchemaV1 | undefined;
	/** Overrides the form's trigger mode for this field. */
	mode?: ValidationMode | undefined;
	/** Extra capabilities composed onto this Bond at construction. */
	extend?: Record<string, unknown>;
	/** Replaces the Bond constructor, so a family can be extended or fused. */
	factory?: ((props: FieldStateProps) => FieldBond) | Factory<FieldBond>;
}

export interface FieldLabelProps<
	E extends HtmlElementTagName = 'label',
	B extends Base = Base
> extends RenderProps<E, B, FieldChildren> {
	/** ID of the associated form control */
	for?: never;
}

export interface FieldControlChangeDetails {
	value: unknown;
	files: File[];
	date: Date | null;
	number: number | undefined;
	checked: boolean;
	amount?: number | undefined;
	lat?: number | undefined;
	lng?: number | undefined;
}

type FieldStateChangeCallback<Value> = (
	value: Value,
	context: Parameters<StateChangeCallback<Value, FieldBond>>[1] & FieldControlChangeDetails
) => void;

export interface FieldControlProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, FieldChildren> {
	/** Current value of the control. */
	value?: unknown;
	/** The value reinterpreted as a Date; `undefined` when it does not parse. */
	valueAsDate?: Date;
	/** The value reinterpreted as a number; `NaN` when it does not parse. */
	valueAsNumber?: number;
	/** Bindable parsed Date, for date and datetime controls. */
	date?: Date | null;
	/** Bindable parsed number, for numeric controls. */
	number?: number;
	/** Bindable checked state, for checkbox and radio controls. */
	checked?: boolean;
	/** Bindable selected file list, for file controls. */
	files?: File[] | null;
	// Native callbacks retain their event-only DOM signatures.
	/** Native input event, fired on every keystroke. */
	oninput?: (event: Event) => void;
	/** Native change event, fired when the value is committed. */
	onchange?: (event: Event) => void;
	/** Native blur event. Runs after the field is marked touched and the `blur` trigger is evaluated. */
	onblur?: (event: FocusEvent) => void;
	/** Semantic callback; runs after the field value commits. */
	onvaluechange?: FieldStateChangeCallback<unknown>;
	/** Semantic callback for numeric controls. */
	onnumberchange?: FieldStateChangeCallback<number | undefined>;
	/** Semantic callback for file controls. */
	onfileschange?: FieldStateChangeCallback<File[]>;
	/** Semantic callback for date and datetime controls. */
	ondatechange?: FieldStateChangeCallback<Date | null>;
	/** Semantic callback for checkbox and radio controls. */
	oncheckedchange?: FieldStateChangeCallback<boolean>;
	/** Control content (Input.Control, Textarea.Control, etc.). Receives { field } in snippet props. */
	children?: FieldChildren;
}

export interface FieldHelperTextProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B, FieldChildren> {
	/** Helper text content rendered under the field control. Receives { field } in snippet props. */
	children?: FieldChildren;
}

export interface FieldErrorProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B, FieldChildren> {
	/** Error content. Defaults to the field's first validation message. Receives { field }. */
	children?: FieldChildren;
}

export type FieldTextProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> = FieldHelperTextProps<E, B>;
