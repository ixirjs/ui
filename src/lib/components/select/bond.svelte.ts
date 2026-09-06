import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { DropdownMenuBondProps } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { SelectPresets } from './types';
import type { SelectBond } from '$ixirjs/ui/components/overlay/popup/types';
export type { SelectBond } from '$ixirjs/ui/components/overlay/popup/types';

export type SelectStateProps = DropdownMenuBondProps & {
	values?: string[];
	value?: string;
	// `| undefined` on both: a root's live-props object exposes them as get/set pairs, and under
	// `exactOptionalPropertyTypes` the setter's parameter has to admit the getter's own type.
	labels?: string[] | undefined;
	label?: string | undefined;
	multiple?: boolean;
	keys?: string[];
	// Reactive search/filter text; read by `filterSelectData` and bound to `Select.Query`.
	query?: string;
	/**
	 * The full ordered option data. Supplying it moves roving, typeahead and label resolution off the
	 * mounted registration map — which under virtualization holds only the rendered window — and onto
	 * the data. Omit it and all three read the map as before.
	 */
	options?: readonly unknown[] | undefined;
	// `never`, not `unknown`: declared on an untyped Bond but assigned from a component that knows its
	// option type, and under `strictFunctionTypes` only `never` accepts a handler for any concrete
	// type. The component's props carry the real signature; call sites below re-widen with a cast.
	/** Stable, unique value per option. Required alongside `options`. */
	optionValue?: ((option: never, index: number) => string) | undefined;
	/** Display and typeahead text per option. */
	optionLabel?: ((option: never, index: number) => string) | undefined;
	presets?: SelectPresets | undefined;
};

export const SelectContext = Kernel.context<SelectBond>('bond/select');
export type SelectBondBase<Props extends SelectStateProps = SelectStateProps> = Omit<
	SelectBond,
	'props'
> & { readonly props: Props };
