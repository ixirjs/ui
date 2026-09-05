/** Diagnostic workloads. Only parity.ts names an executable, scoped equivalence claim. */
import IxirCard from './ixir-card.test.svelte';
import ShadcnCard from './shadcn-card.test.svelte';
import IxirCardDirect from './ixir-card-direct.test.svelte';
import IxirButton from './ixir-button.test.svelte';
import ShadcnButton from './shadcn-button.test.svelte';
import IxirAccordion from './ixir-accordion.test.svelte';
import ShadcnAccordion from './shadcn-accordion.test.svelte';
import IxirAccordionDirect from './ixir-accordion-direct.test.svelte';
import IxirTable from './ixir-table.test.svelte';
import IxirTableDirect from './ixir-table-direct.test.svelte';
import ShadcnTable from './shadcn-table.test.svelte';
import IxirMenu from './ixir-menu.test.svelte';
import ShadcnMenu from './shadcn-menu.test.svelte';
import IxirInput from './ixir-input.test.svelte';
import ShadcnInput from './shadcn-input.test.svelte';
import IxirInputBare from './ixir-input-bare.test.svelte';
import IxirPopover from './ixir-popover.test.svelte';
import ShadcnPopover from './shadcn-popover.test.svelte';
import IxirTree from './ixir-tree.test.svelte';
import ControlTree from './control-tree.test.svelte';

export type Family = {
	name: string;
	/** What one measured unit IS — printed, never assumed. */
	unit: string;
	/**
	 * `zero` = vendored shadcn source with no abstraction layer; `bits` = bits-ui behind the shadcn
	 * wrapper; `hand` = hand-written markup, because shadcn ships nothing for this family at all.
	 */
	opponent: 'zero' | 'bits' | 'hand';
	/** Column heading for the opposing side. `hand` families are a floor, not a competitor. */
	opponentLabel?: string;
	/**
	 * Unit counts for the CLIENT arm, when 100/800 is not survivable. Every client figure is a
	 * slope, so a lower pair is still a valid per-unit cost — but a family that needs one is
	 * reporting something, and the reason belongs in the entry.
	 */
	clientCounts?: [number, number];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ixir: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	shadcn: any;
};

export const FAMILIES: Family[] = [
	{ name: 'card', unit: 'per card', opponent: 'zero', ixir: IxirCard, shadcn: ShadcnCard },
	// The same shipped card, imported part by part rather than through the `Card` namespace. A
	// member expression is a dynamic component, so this arm prices the barrel — not a second
	// architecture. (It replaced `card-wb`, which compared the shipped family against a
	// design-phase prototype; that comparison ended when the family moved onto the same seam.)
	{
		name: 'card-direct',
		unit: 'per card',
		opponent: 'zero',
		ixir: IxirCardDirect,
		shadcn: ShadcnCard
	},
	{ name: 'button', unit: 'per button', opponent: 'zero', ixir: IxirButton, shadcn: ShadcnButton },
	{
		name: 'accordion',
		unit: 'per item',
		opponent: 'bits',
		ixir: IxirAccordion,
		shadcn: ShadcnAccordion,
		// Retain historical counts for baseline continuity; the separate growth gate covers larger mounts.
		clientCounts: [50, 200]
	},
	// The same shipped accordion, imported part by part. The behavioural counterpart of
	// `card-direct`.
	{
		name: 'accordion-direct',
		unit: 'per item',
		opponent: 'bits',
		ixir: IxirAccordionDirect,
		shadcn: ShadcnAccordion,
		clientCounts: [50, 200]
	},
	{ name: 'table', unit: 'per row', opponent: 'zero', ixir: IxirTable, shadcn: ShadcnTable },
	// Four parts per row, so the namespace cost lands hardest here. Same components as `table`.
	{
		name: 'table-direct',
		unit: 'per row',
		opponent: 'zero',
		ixir: IxirTableDirect,
		shadcn: ShadcnTable
	},
	// One unit is one text field. shadcn's is a bare `<input>`; ours is Root + Control, so the
	// skeletons differ by construction — the census prints the difference rather than hiding it.
	{ name: 'input', unit: 'per field', opponent: 'zero', ixir: IxirInput, shadcn: ShadcnInput },
	// The same field as the control alone, no Root: the like-for-like skeleton against shadcn.
	{
		name: 'input-bare',
		unit: 'per field',
		opponent: 'zero',
		ixir: IxirInputBare,
		shadcn: ShadcnInput
	},
	// One unit is one OPEN popover: trigger + content. bits-ui gets `ContentStatic` + `forceMount`
	// so the server emits content instead of an empty portal.
	{
		name: 'popover',
		unit: 'per popover',
		opponent: 'bits',
		ixir: IxirPopover,
		shadcn: ShadcnPopover
	},
	{ name: 'menu', unit: 'per item', opponent: 'bits', ixir: IxirMenu, shadcn: ShadcnMenu },
	{
		name: 'tree',
		unit: 'per node',
		opponent: 'hand',
		opponentLabel: 'control',
		ixir: IxirTree,
		shadcn: ControlTree,
		// Historical diagnostic counts; growth fixtures separately cover breadth and depth.
		clientCounts: [50, 200]
	}
];
