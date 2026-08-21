// The three presets the docs let a reader switch between — the home hero and every component
// preview — plus the snippet each one corresponds to.
//
// Overrides use `!` so they beat the app preset deterministically: preset layers are merged into one
// class string, and Tailwind resolves a same-specificity conflict by stylesheet order, not by the
// order the layers happened to be concatenated in.

import type { Preset } from '$lib/preset';

export const demoPresets: { key: string; label: string; preset: Partial<Preset>; code: string }[] =
	[
		{
			key: 'default',
			label: 'default',
			preset: {},
			code: `setPreset({
  button: ({ variant }) => ({
    class: cn('h-9 px-3.5 rounded-md text-sm font-medium',
      variant === 'outline' && 'border border-border')
  }),
  input: () => ({ class: 'h-9 rounded-md border px-3' }),
  card:  () => ({ class: 'rounded-xl border p-4 shadow-sm' })
});`
		},
		{
			key: 'brutal',
			label: 'brutalist',
			preset: {
				button: () => ({
					class:
						'rounded-none! border-2! border-foreground! font-mono! text-[11px]! tracking-[0.06em] uppercase'
				}),
				input: () => ({ class: 'rounded-none! border-2! border-foreground!' }),
				badge: () => ({ class: 'rounded-none! border-2! border-foreground! font-mono!' }),
				card: () => ({
					class: 'rounded-none! border-2! border-foreground! shadow-[4px_4px_0_var(--foreground)]!'
				})
			},
			code: `setPreset({
  button: () => ({
    class: 'h-9 px-3.5 border-2 border-fg uppercase tracking-wide font-mono text-[11px]'
  }),
  input: () => ({ class: 'h-9 border-2 border-fg px-3' }),
  card:  () => ({ class: 'border-2 border-fg p-4 shadow-[4px_4px_0_currentColor]' })
});`
		},
		{
			key: 'soft',
			label: 'soft',
			preset: {
				button: () => ({ class: 'rounded-full!' }),
				input: () => ({ class: 'rounded-2xl! border-transparent! bg-muted!' }),
				badge: () => ({ class: 'rounded-full!' }),
				card: () => ({
					class: 'rounded-3xl! border-transparent! bg-muted! shadow-xl! shadow-black/5!'
				})
			},
			code: `setPreset({
  button: () => ({ class: 'h-9 px-4 rounded-full text-sm font-medium' }),
  input: () => ({ class: 'h-9 rounded-2xl bg-muted px-4 border-transparent' }),
  card:  () => ({ class: 'rounded-3xl bg-muted p-4 shadow-xl shadow-black/5' })
});`
		}
	];
