import { type ComputePositionReturn, type Placement } from '@floating-ui/dom';
import { Atom, defineAtom, type BondVirtualElement } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { resolveBondPart } from '$ixirjs/ui/shared/authoring/metadata';
import {
	ESCAPE,
	OUTSIDE_PRESS,
	OverlayBond,
	OverlayTriggerAtom,
	escapePolicy,
	outsidePressPolicy,
	positionedCapabilities,
	trappedFocus,
	type OverlayStateProps,
	type OverlayView
} from '$ixirjs/ui/components/overlay';
import type { PortalBond } from '$ixirjs/ui/components/portal';
import type { PopoverStrategy } from '$ixirjs/ui/components/popover/strategy-types';
import {
	popoverTailPresentation,
	popoverContentPresentation,
	popoverIndicatorPresentation,
	popoverOverlayPresentation,
	popoverTriggerPresentation
} from '$ixirjs/ui/components/popover/presentation.svelte';

export {
	getPopoverPosition,
	notifyPopoverComputed,
	popoverNode,
	setPopoverTracking,
	shouldTrackPopoverPosition
} from '$ixirjs/ui/components/popover/position-state';

export type PopoverParams = {
	apply?: (
		node: HTMLElement,
		params: { x: number; y: number; dx: number; dy: number; open: boolean; offset: number }
	) => void;

	onpositionchange?: (node: HTMLElement, params: ComputePositionReturn) => void;
};

export type PopoverEngineCleanup = () => void;
export type PopoverEngineParams = Record<string, unknown> & {
	onpositionchange?: (node: HTMLElement, position: ComputePositionReturn) => void;
};
export type PopoverEngine = (
	bond: PopoverBond
) => (props: PopoverEngineParams, ...args: unknown[]) => PopoverEngineCleanup;

export type PopoverBondProps = OverlayStateProps & {
	disabled: boolean;
	placements: Placement[];
	placement: Placement | undefined;
	offset: number;
	// CSS positioning strategy for the floating content. Set explicitly by the consumer;
	// always authoritative (a host overlay no longer forces it). Defaults to 'absolute'.
	position: 'fixed' | 'absolute';
	portal?: string | PortalBond;
	strategy?: PopoverStrategy;
};

export type PopoverStateProps = PopoverBondProps;

export type TriggerParams = {
	onclick?: (ev: MouseEvent) => void;
};

// Positioned defaults (click trigger, escape, restore-to-trigger) + trapped-focus override.
// The final same-slot policies enrich dismissals with their originating event/reason.
function popoverCapabilities() {
	return [
		...positionedCapabilities().filter(
			(capability) => capability.slot !== ESCAPE && capability.slot !== OUTSIDE_PRESS
		),
		trappedFocus({ restoreFocus: 'trigger', captureFocusOnOpen: false }),
		escapePolicy((bond, event) => {
			const popover = bond as PopoverBondBase;
			popover.stageOpenChange({ event, reason: 'escape' });
			popover.close();
		}),
		outsidePressPolicy({
			event: 'click',
			onDismiss: (event, bond) =>
				(bond as PopoverBondBase).stageOpenChange({ event, reason: 'outside-press' })
		})
	];
}

// Floating-positioned disclosure with optional tail/indicator/virtual-trigger.
// Overlay behaviour via capabilities; adds Tab->focus-content and Tab-trap within content.
export class PopoverBondBase<
	Props extends PopoverBondProps = PopoverBondProps
> extends OverlayBond<Props> {
	position = $state<ComputePositionReturn>();
	// Whether position should be actively computed. Defaults to `open`; can be overridden
	// to keep computing while hiding or to start computing on hover before open.
	tracking = $state<boolean | undefined>(undefined);

	#computedResolve!: (position: ComputePositionReturn) => void;
	// Resolves with the next computed position; renewed after each resolution.
	computed: Promise<ComputePositionReturn> = this.#createComputed();

	constructor(props: Props, name = 'popover') {
		super(props, name);
	}

	#createComputed() {
		return new Promise<ComputePositionReturn>((resolve) => {
			this.#computedResolve = resolve;
		});
	}

	// Notify awaiters of a fresh computation and renew the promise.
	notifyComputed(position: ComputePositionReturn) {
		this.position = position;
		this.#computedResolve(position);
		this.computed = this.#createComputed();
	}

	get shouldTrackPosition() {
		return this.tracking ?? this.isOpen;
	}
}

type PopoverBondView = PopoverBondBase<PopoverBondProps>;

type PopoverHTMLElementNode = Atom<PopoverBond, HTMLElement>;

export function createPopoverAtom<N extends PopoverHTMLElementNode>(
	bond: PopoverBond,
	key: string
): N {
	const part = resolveBondPart(bond.constructor, key);
	const atom = new (part.Ctor as new (bond: PopoverBond) => N)(bond);
	return (part.role ? atom.role(part.role) : atom) as N;
}

export const PopoverTailAtom = defineAtom<OverlayView, HTMLElement>('tail', (atom) => {
	atom.capability(popoverTailPresentation());
});

export class PopoverVirtualTriggerAtom<B extends OverlayView = PopoverBondView> extends Atom<
	B,
	BondVirtualElement
> {
	constructor(bond: B) {
		super(bond, 'virtual-trigger');
	}

	override get attrs() {
		return {};
	}

	override get handlers() {
		return {};
	}

	override get attachments() {
		return {};
	}

	override get spread() {
		return {};
	}

	override get element() {
		return super.element;
	}

	override set element(element: BondVirtualElement | undefined) {
		this.setElement(element);
	}
}

// Overlay container atom: owns the dialog ARIA contract and the focus-trap/escape
// capabilities via `.role('surface')`.
export const PopoverOverlayAtom = defineAtom<OverlayView, HTMLElement>('overlay', (atom) => {
	atom.role('surface');
	atom.capability(popoverOverlayPresentation());
});

// No hand-written handlers: focus-trap + escape onkeydown come from `.role('surface')`.

export const PopoverContentAtom = defineAtom<OverlayView, HTMLElement>('content', (atom) => {
	atom.capability(popoverContentPresentation());
});

export const PopoverIndicatorAtom = defineAtom<OverlayView, HTMLElement>('indicator', (atom) => {
	atom.capability(popoverIndicatorPresentation());
});

// Extends OverlayTriggerAtom with role="button" (non-button), disabled attr (button),
// Tab->focus-content, and Escape->close routing.
export const PopoverTriggerAtom = defineAtom(OverlayTriggerAtom, (atom) => {
	atom.capability(popoverTriggerPresentation());
});

// Fusion spec (§9.4.1): exposes popover's atoms + capabilities to `parts:` without
// converting the generic PopoverBond to a defineBond. Pass as `{ spec: popoverSpec }`.
const popoverSpec = {
	name: 'popover',
	base: PopoverBondBase,
	atoms: {
		trigger: PopoverTriggerAtom,
		'virtual-trigger': PopoverVirtualTriggerAtom,
		overlay: PopoverOverlayAtom,
		content: PopoverContentAtom,
		tail: PopoverTailAtom,
		indicator: PopoverIndicatorAtom
	},
	capabilities: popoverCapabilities
};

export const PopoverBond = defineBond(popoverSpec);

// Propagate OverlayBond's owner context through composed families that share Popover's context.
Object.defineProperty(PopoverBond, 'CONTEXT_KEYS', {
	value: [PopoverBond.CONTEXT_KEY, OverlayBond.CONTEXT_KEY],
	writable: true,
	configurable: true
});

export type PopoverBond = BondOf<typeof PopoverBond>;
