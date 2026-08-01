// @deprecated Menu is consolidated into dropdown-menu; new code should import from `dropdown-menu`.
// MenuBond/MenuBondState extend the dropdown-menu equivalents, overriding only the `menu` DOM namespace.
import {
	DropdownMenuBond,
	DropdownMenuBondState,
	type DropdownMenuBondProps,
	type DropdownMenuBondElements
} from '$svelte-atoms/core/components/dropdown-menu/bond.svelte';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';

export type MenuBondProps = DropdownMenuBondProps;
export type MenuBondElements = DropdownMenuBondElements;

export class MenuBondState<
	Props extends MenuBondProps = MenuBondProps
> extends DropdownMenuBondState<Props> {}

// defineBond over DropdownMenuBond — pure rebrand to the `menu` DOM identity
// (`data-bond="menu"`, preset base `menu.*`); all atoms/capabilities are inherited.
export const MenuBond = defineBond<Record<never, never>, MenuBondState>({
	parts: [DropdownMenuBond],
	name: 'menu',
	atoms: {}
});

export type MenuBond = BondOf<typeof MenuBond>;
