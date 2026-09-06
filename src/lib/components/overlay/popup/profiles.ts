/** Profiles are data. Shared capabilities implement every policy; no per-family setup functions. */
export interface PopupProfile {
	name: string;
	positioned: boolean;
	collection: boolean;
	selection: boolean;
	query: boolean;
	customSelections: boolean;
	dates: boolean;
	pointerAnchor: boolean;
	trigger: 'click' | 'hover' | 'context-menu';
	popupRole: 'dialog' | 'menu' | 'listbox';
}

const popup: PopupProfile = {
	name: 'popover',
	positioned: true,
	collection: false,
	selection: false,
	query: false,
	customSelections: false,
	dates: false,
	pointerAnchor: false,
	trigger: 'click',
	popupRole: 'dialog'
};
const menu: PopupProfile = { ...popup, name: 'dropdown-menu', collection: true, popupRole: 'menu' };
const select: PopupProfile = {
	...menu,
	name: 'select',
	selection: true,
	query: true,
	popupRole: 'listbox'
};

export const profiles = {
	popover: popup,
	'dropdown-menu': menu,
	select,
	combobox: { ...select, name: 'combobox', customSelections: true },
	tooltip: { ...popup, name: 'tooltip', trigger: 'hover' },
	'context-menu': { ...menu, name: 'context-menu', pointerAnchor: true, trigger: 'context-menu' },
	'date-picker': { ...popup, name: 'date-picker', dates: true },
	'popover-dialog': { ...popup, name: 'popover-dialog', positioned: false }
} as const satisfies Record<string, PopupProfile>;

export type PopupFamily = keyof typeof profiles;

// A profile selects allocations at construction; mutating it afterward would invalidate that contract.
for (const profile of Object.values(profiles)) Object.freeze(profile);
Object.freeze(profiles);
