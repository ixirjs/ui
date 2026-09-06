import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { DialogBondProps } from '$ixirjs/ui/components/dialog/bond.svelte';
import type { PopoverDialogPresets } from './types';
import type { PopoverDialogBond } from '$ixirjs/ui/components/overlay/popup/types';
export type { PopoverDialogBond } from '$ixirjs/ui/components/overlay/popup/types';

export type PopoverDialogBondProps = DialogBondProps & {
	presets?: PopoverDialogPresets | undefined;
};

export const PopoverDialogContext = Kernel.context<PopoverDialogBond>('popover-dialog');
