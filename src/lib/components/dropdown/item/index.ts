// @deprecated Import from `select/item` instead.
export {
	SelectItemController as DropdownItemController,
	type SelectItemProps as DropdownItemProps
} from '../../select/item/controller.svelte';

export {
	/** @deprecated Use `selectItem` instead. */
	selectItem as dropdownItem
} from '../../select/item/attachments.svelte';

export { SelectItem as DropdownItem } from '../../select/item';

export type { SelectItemProps as DropdownItemComponentProps } from '../../select/item/types';
