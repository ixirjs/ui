export { DatePicker } from '$ixirjs/ui/components/date-picker';
export type * from '$ixirjs/ui/components/date-picker/types';

// The parts by name, beside the namespace. `<DatePicker.Root>` is a member expression — a DYNAMIC
// component with a fragment boundary per part: a table row of four parts measured mount −37%,
// hydrate −28% and 5 hydration anchors fewer on the direct call site (`bench:vs-shadcn`,
// 2026-08-27). Use these where one part renders many times.
export {
	DatePickerTrigger,
	DatePickerRoot,
	DatePickerCalendar
} from '$ixirjs/ui/components/date-picker';

export type { DatePickerBond } from '$ixirjs/ui/components/overlay/popup/types';
