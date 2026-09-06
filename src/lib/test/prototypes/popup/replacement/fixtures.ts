import type { Component } from 'svelte';
import Popover, {
	capturedBond as capturedPopover
} from '$ixirjs/ui/test/components/popover/popover-atom-probe.test.svelte';
import Menu, {
	capturedBond as capturedMenu
} from '$ixirjs/ui/test/components/dropdown-menu/dropdown-menu-atom-probe.test.svelte';
import Select, {
	capturedBond as capturedSelect
} from '$ixirjs/ui/test/components/select/select-atom-probe.test.svelte';
import Combobox, {
	capturedBond as capturedCombobox
} from '$ixirjs/ui/test/components/combobox/combobox-atom-probe.test.svelte';
import ContextMenu, {
	capturedBond as capturedContextMenu
} from '$ixirjs/ui/test/components/context-menu/context-menu-atom-probe.test.svelte';
import DatePicker from '$ixirjs/ui/test/components/date-picker/date-picker-preset-probe.test.svelte';
import Overlay from '$ixirjs/ui/test/prototypes/popup/replacement/overlay.test.svelte';
import type { PopupFamily } from './profiles';

export type Fixture = {
	name: PopupFamily;
	// Heterogeneous existing fixtures keep their own prop types; this is only the harness boundary.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: Component<any>;
	props?: Record<string, unknown>;
	getBond?: () => unknown;
};
export const fixtures: Fixture[] = [
	{ name: 'popover', component: Popover, getBond: () => capturedPopover },
	{ name: 'dropdown-menu', component: Menu, getBond: () => capturedMenu },
	{ name: 'select', component: Select, getBond: () => capturedSelect },
	{ name: 'combobox', component: Combobox, getBond: () => capturedCombobox },
	{ name: 'tooltip', component: Overlay, props: { kind: 'tooltip' } },
	{ name: 'context-menu', component: ContextMenu, getBond: () => capturedContextMenu },
	{ name: 'date-picker', component: DatePicker, props: { presets: {} } },
	{ name: 'popover-dialog', component: Overlay, props: { kind: 'dialog' } }
];
