export type DropdownMenuItemAtomProps = {
	id: string;
	// `| undefined`: callers pass an unset `disabled` prop; the item treats undefined as not-disabled.
	disabled?: boolean | undefined;
};

export type { DropdownMenuItemAtom } from '$ixirjs/ui/components/overlay/popup/item';
