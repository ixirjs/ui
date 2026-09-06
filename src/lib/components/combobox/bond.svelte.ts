import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { SelectStateProps } from '$ixirjs/ui/components/select/bond.svelte';
import type { ComboboxPresets } from './types';
import type { ComboboxBond } from '$ixirjs/ui/components/overlay/popup/types';
export type { ComboboxBond } from '$ixirjs/ui/components/overlay/popup/types';

export type ComboboxBondProps = SelectStateProps & { presets?: ComboboxPresets | undefined };

export const ComboboxContext = Kernel.context<ComboboxBond>('bond/combobox');
export type ComboboxBondBase<Props extends ComboboxBondProps = ComboboxBondProps> = Omit<
	ComboboxBond,
	'props'
> & { readonly props: Props };
