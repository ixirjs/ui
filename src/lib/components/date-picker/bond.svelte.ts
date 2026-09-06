import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { PopoverBondProps } from '$ixirjs/ui/components/popover/bond.svelte';
import type { CalendarBondProps } from '$ixirjs/ui/components/calendar/bond.svelte';
import type { DatePickerPresets } from './types';
import type { DatePickerBond } from '$ixirjs/ui/components/overlay/popup/types';
export type { DatePickerBond } from '$ixirjs/ui/components/overlay/popup/types';

export type DatePickerBondProps = Omit<PopoverBondProps, 'presets'> &
	Omit<CalendarBondProps, 'value' | 'start' | 'end' | 'presets'> & {
		value?: Date | undefined;
		start?: Date | undefined;
		end?: Date | undefined;
		format?: string;
		placeholder?: string;
		presets?: DatePickerPresets | undefined;
		readonly rest?: Record<string, unknown>;
	};

export const DatePickerContext = Kernel.context<DatePickerBond>('bond/date-picker');
