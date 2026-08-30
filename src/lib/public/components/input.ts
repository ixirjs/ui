export * as Input from '$ixirjs/ui/components/input/atoms';
export { default as PinInput } from '$ixirjs/ui/components/input/input-pin-control.svelte';
/** @deprecated Renamed to `PinInput`. */
export { default as OtpInput } from '$ixirjs/ui/components/input/input-pin-control.svelte';
export type * from '$ixirjs/ui/components/input/types';

// The parts by name, beside the namespace. `<Input.Root>` is a member expression — a DYNAMIC
// component with a fragment boundary per part: a table row of four parts measured mount −37%,
// hydrate −28% and 5 hydration anchors fewer on the direct call site (`bench:vs-shadcn`,
// 2026-08-27). Use these where one part renders many times.
export {
	InputRoot,
	InputControl,
	InputNumberControl,
	InputTimeControl,
	InputDateTimeControl,
	InputDateControl,
	InputFileControl,
	InputUrlControl,
	InputEmailControl,
	InputPasswordControl,
	InputTextControl,
	InputPhoneControl,
	InputLocationControl,
	InputPinControl,
	InputOtpControl,
	InputCurrencyControl,
	InputColorControl,
	InputColorSwatch,
	InputIcon,
	InputPlaceholder
} from '$ixirjs/ui/components/input';
