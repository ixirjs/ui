export { default as Root } from './combobox-root.svelte';
export { default as Trigger } from './combobox-trigger.svelte';
export { default as Item } from './combobox-item.svelte';
// @deprecated Use Combobox.Control instead
export { default as Input } from './combobox-control.svelte';
export { default as Control } from './combobox-control.svelte';
export { default as Selections } from './combobox-selections.svelte';
export {
	Arrow,
	Indicator,
	Content,
	List,
	Group,
	Divider,
	Title,
	Selection,
	Placeholder,
	// The filter box — `Select.Query` resolves the combobox bond via the shared popover
	// context, so it drives the inherited `query` field (separate from the value `Control`).
	Query
} from '../select/atoms';
