export * as Calendar from './atoms';
export * from './bond.svelte';
export * from './runes.svelte';
export * from './types';

// The same parts, named directly. `<Calendar.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as CalendarRoot } from './calendar-root.svelte';
export { default as CalendarBody } from './calendar-body.svelte';
export { default as CalendarDay } from './calendar-day.svelte';
export { default as CalendarHeader } from './calendar-header.svelte';
export { default as CalendarWeekDay } from './calendar-week-day.svelte';
