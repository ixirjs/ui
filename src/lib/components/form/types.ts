import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { HtmlAtomProps, Base } from '$ixirjs/ui/components/atom';
import type { Factory, Override, StateChangeCallback } from '$ixirjs/ui/types';
import type { FormBond } from './bond.svelte';
import type { FieldBond, FieldStateProps } from './field/bond.svelte';

type SnippetProps = Record<string, unknown>;
type Schema = unknown;

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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FormRootExtendProps {}

interface FormCommonProps {
	factory?: Factory<FormBond>;
	// Validation adapter/schema forwarded to the form bond (typed `unknown` there).
	validator?: unknown;
	preset?: HtmlAtomProps<'form'>['preset'];
}

type FormRenderlessProps = {
	renderless?: true;
	class?: never;
	children?: FormChildren;
};

type FormRenderfullProps<B extends Base = Base> = Override<
	HtmlAtomProps<'form', B, FormChildren>,
	{
		renderless?: false;
		children?: FormChildren;
	}
> &
	HTMLAttributes<HTMLFormElement>;

export type FormRootProps<B extends Base = Base> = FormCommonProps &
	FormRootExtendProps &
	(FormRenderlessProps | FormRenderfullProps<B>);

export interface FieldRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
	disabled?: boolean;
	readonly?: boolean;
	name?: string;
	value?: unknown;
	schema?: Schema;
	validator?: unknown;
	extend?: Record<string, unknown>;
	factory?: ((props: FieldStateProps) => FieldBond) | Factory<FieldBond>;
}

export interface FieldLabelProps<
	E extends keyof HTMLElementTagNameMap = 'label',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
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
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
	value?: unknown;
	valueAsDate?: Date;
	valueAsNumber?: number;
	date?: Date | null;
	number?: number;
	checked?: boolean;
	files?: File[] | null;
	// Native callbacks retain their event-only DOM signatures.
	oninput?: (event: Event) => void;
	onchange?: (event: Event) => void;
	onvaluechange?: FieldStateChangeCallback<unknown>;
	onnumberchange?: FieldStateChangeCallback<number | undefined>;
	onfileschange?: FieldStateChangeCallback<File[]>;
	ondatechange?: FieldStateChangeCallback<Date | null>;
	oncheckedchange?: FieldStateChangeCallback<boolean>;
	children?: FieldChildren;
}

export interface FieldHelperTextProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
	children?: FieldChildren;
}

export type FieldTextProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> = FieldHelperTextProps<E, B>;
