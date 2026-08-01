import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
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

interface CommonProps {
	factory?: Factory<FormBond>;
	// Validation adapter/schema forwarded to the form bond (typed `unknown` there).
	validator?: unknown;
}

export interface FormRootProps<B extends Base = Base>
	extends HtmlAtomProps<'form', B, FormChildren>, CommonProps {
	renderless?: boolean;
	children?: FormChildren;
}

export interface FieldRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
	disabled?: boolean;
	readonly?: boolean;
	name?: string;
	value?: unknown;
	schema?: Schema;
	parse?: (schema: Schema) => void;
	extend?: Record<string, unknown>;
	factory?: ((props: FieldStateProps) => FieldBond) | Factory<FieldBond>;
}

export interface FieldLabelProps<
	E extends keyof HTMLElementTagNameMap = 'label',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
	for?: never;
}

export interface FieldControlProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
	value?: unknown;
	valueAsDate?: Date;
	valueAsNumber?: number;
	checked?: boolean;
	files?: File[] | null;
	oninput?: (ev: CustomEvent, detail?: { value: unknown }) => void;
	children?: FieldChildren;
}

export interface FieldHelperTextProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, FieldChildren> {
	children?: FieldChildren;
}

export interface FieldTextProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends FieldHelperTextProps<E, B> {}
