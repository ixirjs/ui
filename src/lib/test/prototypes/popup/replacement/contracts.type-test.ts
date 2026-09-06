import { PopupBond } from './bond.svelte';
import type { PopupBonds, PopupProps } from './types';
import type { PopupFamily } from './profiles';
import type { StateChangeContext } from '$ixirjs/ui/types';

type Assert<T extends Record<PopupFamily, true>> = T;
/** Check every implementation member, including self-typed callbacks, against each family view. */
export type InstanceContracts = Assert<{
	[F in PopupFamily]: PopupBond<F> extends PopupBonds[F] ? true : false;
}>;
type Commit = (commit: (next: boolean, context: StateChangeContext<unknown>) => void) => void;
export type CommitContracts = Assert<{
	[F in PopupFamily]: PopupBond<F>['bindCommit'] extends Commit ? true : false;
}>;

import { menuItem, selectItem } from './item';
import type { SelectRootProps } from '$ixirjs/ui/components/select/types';

export function authoringContracts(props: PopupProps['select']) {
	const select = PopupBond.create('select', props);
	select.select(['a', 'b']);
	const item = selectItem({ id: 'item', value: 'a', data: { rank: 1 } }, select);
	const rank: number | undefined = item.data?.rank;
	// @ts-expect-error Popup roots do not accept custom factories.
	const factory: SelectRootProps<string>['factory'] = undefined;
	// @ts-expect-error Select has no editable input model.
	void select.input;
	// @ts-expect-error The supported command takes arrays, not the early prototype's scalar API.
	select.select('a');
	const popover = PopupBond.create('popover', props);
	// @ts-expect-error A disclosure does not expose selection.
	popover.select(['a']);
	// @ts-expect-error Profiles cannot be mutated after capability allocation.
	popover.profile.selection = true;
	const menu = menuItem({ id: 'menu' }, PopupBond.create('dropdown-menu', props));
	// @ts-expect-error Menu item views do not promise selection functionality.
	menu.select();
	// @ts-expect-error DatePicker requires its calendar backing, not merely popover props.
	PopupBond.create('date-picker', props);
	return { select, item, rank, factory };
}
