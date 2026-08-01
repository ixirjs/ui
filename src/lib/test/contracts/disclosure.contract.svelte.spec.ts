import { render } from 'vitest-browser-svelte';
import CollapsibleRoot from '$ixirjs/ui/components/collapsible/collapsible-root.svelte';
import PopoverRoot from '$ixirjs/ui/components/popover/popover-root.svelte';
import OverlayDisclosureProbe from './overlay-disclosure-probe.test.svelte';
import type { Bond } from '$ixirjs/ui/shared/bond/bond.svelte';
import { defineDisclosureContract, type DisclosureContractDriver } from './disclosure-contract';

type DisclosureBond = Bond & {
	readonly isOpen: boolean;
	open(): void;
	close(): void;
};

type DisclosureHandle = { getBond(): DisclosureBond };
type RenderedDisclosure = {
	component: unknown;
	rerender: (props: Record<string, unknown>) => Promise<void>;
	unmount: () => void;
};

function driver(
	result: RenderedDisclosure,
	onopenchange: (value: boolean, context: { bond?: DisclosureBond }) => void
): DisclosureContractDriver {
	const bond = (result.component as DisclosureHandle).getBond();
	return {
		isOpen: () => bond.isOpen,
		parentSet: (open) => result.rerender({ open, onopenchange }),
		open: () => bond.open(),
		close: () => bond.close(),
		destroy: result.unmount
	};
}

function overlayDriver(
	kind: 'dialog' | 'drawer',
	recordChange: (value: boolean, committedValue: boolean | undefined) => void
): DisclosureContractDriver {
	const result = render(OverlayDisclosureProbe, { kind, onchange: recordChange });
	const bond = (result.component as unknown as { getBond(): DisclosureBond | undefined }).getBond();
	if (!bond) throw new Error(`${kind} contract probe did not expose its Bond`);
	return {
		isOpen: () => bond.isOpen,
		parentSet: (open) => result.rerender({ kind, open, onchange: recordChange }),
		open: () => bond.open(),
		close: () => bond.close(),
		destroy: result.unmount
	};
}

defineDisclosureContract('Collapsible', (recordChange) => {
	const onopenchange = (value: boolean, { bond }: { bond?: DisclosureBond }) =>
		recordChange(value, bond?.isOpen);
	return driver(render(CollapsibleRoot, { onopenchange }), onopenchange);
});

defineDisclosureContract('Popover', (recordChange) => {
	const onopenchange = (value: boolean, { bond }: { bond?: DisclosureBond }) =>
		recordChange(value, bond?.isOpen);
	return driver(render(PopoverRoot, { onopenchange }), onopenchange);
});

defineDisclosureContract('Dialog', (recordChange) => overlayDriver('dialog', recordChange));
defineDisclosureContract('Drawer', (recordChange) => overlayDriver('drawer', recordChange));
