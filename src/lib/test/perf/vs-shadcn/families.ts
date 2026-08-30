/** The parity set: one entry per family, both sides rendering the same fixture shape. */
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
		// 50/200, not 100/800: our accordion mount is superlinear, so 800 items is minutes per round.
		// A cold 400-item mount costs 2.2 s against bits-ui's 0.09 — see §6 of
		// docs/research/perf-vs-shadcn-2026-08.md. Every figure here is a slope, so the low pair is
		// still a valid per-unit cost; it simply understates the gap at scale. Raise it to 100/800
		// once the mount is linear.
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
	{ name: 'menu', unit: 'per item', opponent: 'bits', ixir: IxirMenu, shadcn: ShadcnMenu },
	{
		name: 'tree',
		unit: 'per node',
		opponent: 'hand',
		opponentLabel: 'control',
		ixir: IxirTree,
		shadcn: ControlTree,
		// Same reason as accordion: the mount is superlinear, so 800 nodes is minutes per round.
		clientCounts: [50, 200]
	}
];
