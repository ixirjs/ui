export * as Input from './atoms';
export { default as PinInput } from './input-pin-control.svelte';
/** @deprecated Renamed to `PinInput`. */
export { default as OtpInput } from './input-pin-control.svelte';
export * from './bond.svelte';
export * from './types';

// The same parts, named directly. `<Input.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
//
// `Input.Root` is the reusable SHELL — the bordered field frame that Combobox, Popover, DropdownMenu
// and consumer compositions fill with their own content — and its Bond is what spans that content:
// `Placeholder` gating, `role="group"`, root-level `bind:value`, `bond.number`/`bond.date`, the
// `{ input }` snippet arg. That is the default shape. The one exception: a plain text field repeated
// many times with nothing to coordinate can render the control alone, at the cost of the shell
// (SSR: Root + TextControl ≈ 6.5 µs/field, bare `InputTextControl` ≈ 2 µs against shadcn's bare
// `<input>` at ≈ 1.6; `bench:vs-shadcn input input-bare`, 2026-09-02).
export { default as InputRoot } from './input-root.svelte';
export { default as InputControl } from './input-control.svelte';
export { default as InputNumberControl } from './input-number-control.svelte';
export { default as InputTimeControl } from './time/time-control.svelte';
export { default as InputDateTimeControl } from './time/datetime-control.svelte';
export { default as InputDateControl } from './time/date-control.svelte';
export { default as InputFileControl } from './input-file-control.svelte';
export { default as InputUrlControl } from './input-url-control.svelte';
export { default as InputEmailControl } from './input-email-control.svelte';
export { default as InputPasswordControl } from './input-password-control.svelte';
export { default as InputTextControl } from './input-text-control.svelte';
export { default as InputPhoneControl } from './input-phone-control.svelte';
export { default as InputLocationControl } from './input-location.svelte';
export { default as InputPinControl } from './input-pin-control.svelte';
/** @deprecated Renamed to `InputPinControl`. */
export { default as InputOtpControl } from './input-pin-control.svelte';
export { default as InputCurrencyControl } from './input-currency-control.svelte';
export { default as InputColorControl } from './color/color-control.svelte';
export { default as InputColorSwatch } from './color/swatch.svelte';
export { default as InputIcon } from './input-icon.svelte';
export { default as InputPlaceholder } from './input-placeholder.svelte';
