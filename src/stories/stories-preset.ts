import { clickoutDrawer, clickoutPopover, Input } from '$lib';
import { closeOverlay } from '$lib/components/portal/host/policies/overlay-view';
import type { PopoverBond } from '$lib/components/popover';
import type { Preset } from '$lib/context';
import { createAttachmentKey } from 'svelte/attachments';

/**
 * Minimalist preset for Storybook stories.
 *
 * This is the story DECORATOR preset (applied once in StoryRoot.svelte, which
 * wraps every story). It is the single source of the minimalist look so stories
 * stay clean: rely on these defaults, and only pass `class` at the story level
 * to override a specific case (story `class` wins — it is appended after the
 * `$preset` slot in every component root).
 *
 * NOTE: this is intentionally separate from the app/docs presets
 * (the `routes/.../shared.ts` presets). Do not fold app styling in here, and do not push these
 * story defaults into the app preset.
 *
 * Design language (minimalist):
 *  - surfaces: subtle `border-border`, `bg-popover`/`bg-card`, `rounded-lg`, soft `shadow-sm`
 *  - items: `rounded-md`, low-contrast `hover:bg-foreground/5`, no heavy active states
 *  - typography: restrained — `text-sm`, `font-medium`/`font-semibold`, muted descriptions
 *  - colour: design tokens only; semantic intent (info/success/...) shown as a thin accent
 */

// Shared minimalist building blocks ------------------------------------------------

/** A floating surface: menu / popover / dropdown / select content panels. */
const SURFACE =
	'z-50 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none ring-1 ring-foreground/5 backdrop-blur-sm';

/** A compact command surface for menus and searchable option lists. */
const MENU_SURFACE = `${SURFACE} min-w-44 p-1`;

/** A selectable row inside a surface. */
const ITEM =
	'group flex min-h-9 w-full cursor-pointer select-none items-center gap-2 rounded-md [border-bottom-width:0] px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors duration-100 hover:bg-muted hover:text-foreground active:bg-muted/80 focus-visible:bg-muted aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-45 data-[highlighted=true]:bg-muted data-[highlighted=true]:text-foreground data-[selected]:bg-primary/10 data-[selected]:font-medium data-[selected]:text-primary';

export const storiesPreset: Partial<Preset> = {
	root: () => ({
		class: 'flex flex-col p-0'
	}),

	// Accordion — one unified card, items separated by hairline dividers (root base
	// already supplies `bg-card flex list-none flex-col`). -----------------------------
	accordion: () => ({
		as: 'ul',
		class: 'w-full max-w-md divide-y divide-border overflow-hidden rounded-lg border'
	}),
	'accordion.item': () => ({ as: 'li' }),
	'accordion.item.header': (bond) => {
		const itemBond = bond as { isActive?: boolean } | undefined;
		return () => ({
			class: [
				'justify-between gap-3 px-3 py-3 text-sm font-medium transition-colors hover:bg-foreground/5',
				itemBond?.isActive ? 'text-foreground' : 'text-muted-foreground'
			]
		});
	},
	'accordion.item.body': () => ({
		class: 'overflow-hidden text-sm text-muted-foreground'
	}),
	'accordion.item.indicator': () => ({
		class: 'size-4 shrink-0 text-muted-foreground'
	}),

	// Button ------------------------------------------------------------------------
	// Each variant owns its full per-state design (rest / hover / active). The base
	// button.svelte hard-codes primary state classes (`active:bg-primary/90` etc.), so a
	// variant MUST declare its own `active:` (and `hover:`) or it bleeds primary on press —
	// e.g. destructive must not turn primary-green when held down.
	button: () => ({
		class:
			'h-10 items-center rounded-md px-3 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50',
		variants: {
			variant: {
				primary: {
					class: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80'
				},
				secondary: {
					class:
						'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70'
				},
				destructive: {
					class:
						'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80'
				},
				outline: {
					class:
						'border border-border bg-transparent text-foreground hover:bg-foreground/5 active:bg-foreground/10'
				},
				ghost: {
					class: 'bg-transparent text-foreground hover:bg-foreground/5 active:bg-foreground/10'
				}
			}
		},
		compounds: [],
		defaults: { variant: 'primary' }
	}),

	// Badge / chip ------------------------------------------------------------------
	badge: () => ({
		class: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium'
	}),

	// Card --------------------------------------------------------------------------
	card: () => ({ class: 'rounded-lg border border-border bg-card' }),
	'card.header': () => ({ class: 'flex flex-col gap-1 border-b border-border px-4 py-3' }),
	'card.title': () => ({ class: 'text-sm font-semibold text-foreground' }),
	'card.subtitle': () => ({ class: 'text-xs text-muted-foreground' }),
	'card.description': () => ({ class: 'text-sm text-muted-foreground' }),
	'card.body': () => ({ class: 'px-4 py-3 text-sm text-foreground' }),
	'card.content': () => ({ class: 'px-4 py-3 text-sm text-foreground' }),
	'card.footer': () => ({ class: 'flex items-center gap-2 border-t border-border px-4 py-3' }),

	// Datagrid ----------------------------------------------------------------------
	// Gutters live on cells/columns (not the row) so row separators run edge-to-edge while
	// content stays inset — the standard data-grid look. Header labels are small, tracked,
	// muted caps; the body inherits the card's `text-sm`.
	datagrid: () => ({ class: 'overflow-hidden rounded-lg border border-border bg-card text-sm' }),
	'datagrid.header': () => ({ class: 'bg-muted/40' }),
	'datagrid.column': () => ({
		class:
			'h-10 items-center px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase'
	}),
	'datagrid.cell': () => ({ class: 'px-3' }),

	// Collapsible — a single bordered card; header/body fill to the edges (root base
	// already supplies `flex w-full flex-col overflow-hidden`). ------------------------
	collapsible: () => ({ class: 'rounded-lg border bg-card' }),
	'collapsible.header': () => ({
		class:
			'justify-between gap-3 px-3 py-3 text-sm font-medium transition-colors hover:bg-foreground/5'
	}),
	'collapsible.body': () => ({ class: 'text-sm text-muted-foreground' }),
	'collapsible.indicator': () => ({ class: 'size-4 shrink-0 text-muted-foreground' }),

	// Popover / menu / dropdown surfaces + items ------------------------------------
	'popover.content': (bond) => {
		const isAutoClosable = (bond as unknown as PopoverBond)?.state?.props?.rest?.autoClose ?? false;
		return {
			class: `${SURFACE} max-w-sm p-3 text-sm leading-relaxed`,
			[createAttachmentKey()]: (node: HTMLElement) => {
				if (!isAutoClosable) return;
				return clickoutPopover((_, atom) => {
					closeOverlay(atom);
				})(node);
			}
		};
	},
	'popover.arrow': () => ({ class: 'text-popover drop-shadow-sm' }),
	'popover.indicator': () => ({ class: 'size-4 shrink-0 text-muted-foreground' }),
	'menu.content': () => ({
		class: MENU_SURFACE,
		[createAttachmentKey()]: clickoutPopover((_, atom) => {
			closeOverlay(atom);
		})
	}),
	'dropdown.trigger': () => ({ base: Input.Root }),
	'dropdown.item': () => ({ class: ITEM }),
	'combobox.item': () => ({ class: ITEM }),
	'list.item': () => ({ class: ITEM }),
	// A visible separator line between menu sections (the part only ships `my-1` spacing).
	'list.divider': () => ({ class: 'h-px bg-border' }),

	// Overlay menu families resolve their content/item preset as `<bond>.content` / `<bond>.item`
	// (e.g. `dropdown-menu.content`). These keys are component-specific, so a class-less menu
	// would otherwise render surface-less — give them the shared minimalist surface + row style.
	'dropdown-menu.content': () => ({ class: MENU_SURFACE }),
	'dropdown-menu.item': () => ({ class: ITEM }),
	'context-menu.content': () => ({ class: MENU_SURFACE }),
	'context-menu.item': () => ({ class: ITEM }),
	'select.content': () => ({ class: `${MENU_SURFACE} max-h-72 overflow-y-auto` }),
	'select.item': () => ({ class: ITEM }),
	'combobox.content': () => ({ class: `${MENU_SURFACE} max-h-72 overflow-y-auto` }),

	// Dialog ------------------------------------------------------------------------
	'dialog.content': () => ({
		class: 'w-full max-w-lg rounded-lg border border-border bg-card shadow-sm'
	}),
	'dialog.header': () => ({ class: 'flex items-center gap-3 border-b border-border px-5 py-4' }),
	'dialog.title': () => ({ class: 'text-base font-semibold text-foreground' }),
	'dialog.body': () => ({ class: 'px-5 py-4 text-sm text-foreground' }),
	'dialog.footer': () => ({ class: 'flex justify-end gap-2 border-t border-border px-5 py-4' }),

	// Drawer ------------------------------------------------------------------------
	'drawer.content': () => ({
		class: 'border-border bg-card',
		[createAttachmentKey()]: clickoutDrawer((_, bond) => {
			bond?.state?.close?.();
		})
	}),
	'drawer.header': () => ({
		class: 'flex items-center justify-between border-b border-border px-6 py-4'
	}),
	'drawer.title': () => ({ class: 'text-base font-semibold text-foreground' }),
	'drawer.description': () => ({ class: 'text-sm text-muted-foreground' }),
	'drawer.footer': () => ({ class: 'border-t border-border px-6 py-4' }),

	// Alert — soft full-colour variant surfaces (the original story look). The parts are
	// flat children carrying named CSS `grid-area`s (see alert.css), so the root drives a
	// `grid-template-areas` template: an icon column, a stacked title/description/actions
	// column, and a trailing close-button column. No row-gap — parts use their own `mt-*`
	// margins so absent rows (e.g. no actions) collapse without leaving dead space. ------
	alert: () => ({
		class:
			"relative grid grid-cols-[auto_1fr_auto] items-start gap-x-3 rounded-md border p-4 transition-all duration-200 [grid-template-areas:'icon_title_close-button'_'icon_description_close-button'_'icon_actions_close-button'_'icon_content_close-button']",
		variants: {
			variant: {
				info: {
					class:
						'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-100'
				},
				success: {
					class:
						'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/50 dark:border-green-800 dark:text-green-100'
				},
				warning: {
					class:
						'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-100'
				},
				error: {
					class:
						'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/50 dark:border-red-800 dark:text-red-100'
				}
			}
		},
		defaults: { variant: 'info' }
	}),
	'alert.icon': () => ({
		class: 'mt-0.5 inline-flex aspect-square size-4 shrink-0 items-center justify-center'
	}),
	// Empty in most stories (title/description are rendered as their own parts) — hide it
	// so it doesn't occupy a grid row; in the "Minimal" story it holds the text instead.
	'alert.content': () => ({ class: 'space-y-1 empty:hidden' }),
	'alert.title': () => ({ class: 'text-md font-semibold leading-tight' }),
	'alert.description': () => ({ class: 'text-sm leading-relaxed opacity-90' }),
	'alert.actions': () => ({ class: 'mt-3 flex items-center gap-2' }),
	'alert.close-button': () => ({
		class:
			'size-6 justify-self-end rounded-md p-0.5 opacity-70 transition-all hover:bg-black/10 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:hover:bg-white/10'
	}),

	// Toast -------------------------------------------------------------------------
	toast: () => ({
		class:
			'relative flex w-80 flex-col gap-1 rounded-lg border border-border bg-card p-4 pr-8 shadow-sm',
		variants: {
			variant: {
				default: { class: 'border-border text-card-foreground' },
				info: { class: 'border-l-2 border-l-info' },
				success: { class: 'border-l-2 border-l-success' },
				warning: { class: 'border-l-2 border-l-warning' },
				error: { class: 'border-l-2 border-l-destructive' }
			}
		}
	}),
	'toast.title': () => ({ class: 'text-sm font-medium leading-tight text-foreground' }),
	'toast.description': () => ({ class: 'text-sm text-muted-foreground' }),
	'toast.close': () => ({
		class:
			'absolute top-2 right-2 rounded p-1 text-muted-foreground opacity-50 transition-opacity hover:opacity-100'
	})
};
