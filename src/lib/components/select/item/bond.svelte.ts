export type SelectItemAtomProps<T = unknown> = {
	value: string;
	label?: string;
	data?: T | undefined;
	id?: string;
};

export type { SelectItemAtom } from '$ixirjs/ui/components/overlay/popup/item';
