<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { FieldBond, FieldContext } from './bond.svelte';
	import type { FieldRootProps } from '$ixirjs/ui/components/form/types';

	const ID = $props.id();

	let {
		value = $bindable(),
		as = undefined,
		base = undefined,
		name = undefined,
		disabled = false,
		readonly = false,
		required = false,
		schema = undefined,
		mode = undefined,
		extend = {},
		factory = undefined,
		children = undefined,
		...restProps
	}: FieldRootProps = $props();

	// The control writes the parsed shapes here; the root owns only `value`.
	let files = $state<File[] | undefined>();
	let date = $state<Date | null | undefined>();
	let number = $state<number | undefined>();
	let checked = $state<boolean | undefined>();

	// Live props: read through getters wherever the Bond needs them; the control writes back.
	const bondProps = {
		get id() {
			return ID;
		},
		get name() {
			return name;
		},
		set name(next: string | undefined) {
			name = next;
		},
		get value() {
			return value;
		},
		set value(next: unknown) {
			value = next;
		},
		get files() {
			return files;
		},
		set files(next: File[] | undefined) {
			files = next;
		},
		get date() {
			return date;
		},
		set date(next: Date | null | undefined) {
			date = next;
		},
		get number() {
			return number;
		},
		set number(next: number | undefined) {
			number = next;
		},
		get checked() {
			return checked;
		},
		set checked(next: boolean | undefined) {
			checked = next;
		},
		get type() {
			return typeof value;
		},
		get disabled() {
			return disabled;
		},
		get readonly() {
			return readonly;
		},
		get required() {
			return required;
		},
		get schema() {
			return schema;
		},
		get mode() {
			return mode;
		},
		get extend() {
			return extend;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = FieldContext.share(
		build
			? (build as (props: typeof bondProps) => FieldBond)(bondProps)
			: FieldBond.create(bondProps)
	);
	// Registered with the form at init — document order — and released on teardown.
	const detach = bond.form?.mountField(bond.id, bond);
	$effect(() => detach);
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'field',
		class: 'flex flex-col',
		state: bond,
		as: () => as,
		base: () => base,
		// Bond state is not markup: only these select preset variants, and none reach the DOM.
		variantProps: () => ({ disabled, readonly, required }),
		attrs: () => {
			const hasErrors = bond.isInvalid;
			return {
				id: bond.rootId,
				role: 'group',
				'aria-labelledby': bond.labelId,
				// Prefer the error message when there is one, but fall back to the helper text: a field
				// with errors and no `Field.Error` rendered still has something to describe it.
				'aria-describedby': hasErrors ? (bond.errorId ?? bond.descriptionId) : bond.descriptionId,
				'aria-invalid': `${hasErrors}`
			};
		}
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { field: bond })}
