import { untrack } from 'svelte';
import { type ComputePositionReturn, type Placement } from '@floating-ui/dom';
import { Atom, defineAtom, type BondVirtualElement } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf, type BondSpec } from '$svelte-atoms/core/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import { focus, getElementId, isBrowser } from '$svelte-atoms/core/utils/dom.svelte';
import {
	OverlayBond,
	OverlayTriggerAtom,
	positionedCapabilities,
	trappedFocus,
	type OverlayStateProps,
	type OverlayView,
	type PositionedOverlayElements
} from '$svelte-atoms/core/components/portal/host';
import {
	closeOverlay,
	overlayIsDisabled,
	overlayIsOpen
} from '$svelte-atoms/core/components/portal/host/policies/overlay-view';
import type { PortalBond } from '../portal';
import type { PopoverStrategy } from './strategy-types';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PopoverParams = {
	apply?: (
		node: HTMLElement,
		params: { x: number; y: number; dx: number; dy: number; open: boolean; offset: number }
	) => void;

	onchange?: (node: HTMLElement, params: ComputePositionReturn) => void;
};

export type PopoverEngineCleanup = () => void;
export type PopoverEngineParams = Record<string, unknown> & {
	onchange?: (node: HTMLElement, position: ComputePositionReturn) => void;
};
export type PopoverEngine = (
	bond: PopoverBond
) => (props: PopoverEngineParams, ...args: unknown[]) => PopoverEngineCleanup;

export type PopoverContentPropsParams = {
	engine?: 'internal' | PopoverEngine | undefined;
};

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

export type PopoverDomElements = PositionedOverlayElements & {
	trigger?: HTMLElement;
	'virtual-trigger'?: BondVirtualElement;
	overlay?: HTMLElement;
	content?: HTMLElement;
	indicator?: HTMLElement;
	arrow?: HTMLElement;
};

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const POPOVER_ARROW = sharedCapabilityKey<void>('@svelte-atoms/popover:arrow');
const POPOVER_OVERLAY = sharedCapabilityKey<void>('@svelte-atoms/popover:overlay');
const POPOVER_CONTENT = sharedCapabilityKey<void>('@svelte-atoms/popover:content');
const POPOVER_INDICATOR = sharedCapabilityKey<void>('@svelte-atoms/popover:indicator');
const POPOVER_TRIGGER = sharedCapabilityKey<void>('@svelte-atoms/popover:trigger');

// Positioned defaults (click trigger, escape, restore-to-trigger) + trapped-focus override.
// Shared by PopoverBond constructor and popoverSpec so they never drift.
function popoverCapabilities() {
	return [
		...positionedCapabilities(),
		trappedFocus({ restoreFocus: 'trigger', captureFocusOnOpen: false })
	];
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

// Floating-positioned disclosure with optional arrow/indicator/virtual-trigger.
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

// -----------------------------------------------------------------------------
// Legacy state surface adapters
// -----------------------------------------------------------------------------

type PopoverLegacyStateSurface = {
	position?: ComputePositionReturn;
	tracking?: boolean | undefined;
	computed?: Promise<ComputePositionReturn>;
	shouldTrackPosition?: boolean;
	notifyComputed?: (position: ComputePositionReturn) => void;
};

type PopoverBondSurface = PopoverLegacyStateSurface;

function popoverBondSurface(bond: OverlayView): PopoverBondSurface {
	return bond as unknown as PopoverBondSurface;
}

function popoverStateSurface(bond: OverlayView): PopoverLegacyStateSurface {
	return (bond.state ?? {}) as PopoverLegacyStateSurface;
}

export function getPopoverPosition(bond: OverlayView): ComputePositionReturn | undefined {
	return popoverBondSurface(bond).position ?? popoverStateSurface(bond).position;
}

export function setPopoverTracking(bond: OverlayView, tracking: boolean | undefined): void {
	if ('tracking' in bond) {
		popoverBondSurface(bond).tracking = tracking;
		return;
	}
	popoverStateSurface(bond).tracking = tracking;
}

export function shouldTrackPopoverPosition(bond: OverlayView): boolean {
	const bondValue = popoverBondSurface(bond).shouldTrackPosition;
	return bondValue ?? popoverStateSurface(bond).shouldTrackPosition ?? overlayIsOpen(bond);
}

export function notifyPopoverComputed(bond: OverlayView, position: ComputePositionReturn): void {
	const bondNotify = popoverBondSurface(bond).notifyComputed;
	if (bondNotify) {
		bondNotify.call(bond, position);
		return;
	}
	popoverStateSurface(bond).notifyComputed?.(position);
}

export function popoverNode<N extends Atom = Atom>(bond: OverlayView, key: string): N | undefined {
	return bond.node<N>(key);
}

// -----------------------------------------------------------------------------
// Atom factory extension point
// -----------------------------------------------------------------------------

type PopoverHTMLElementNode = Atom<PopoverBond, HTMLElement>;

export function createPopoverAtom<N extends PopoverHTMLElementNode>(
	bond: PopoverBond,
	key: string,
	fallback: (bond: PopoverBond) => N
): N {
	const method = (bond as unknown as Record<string, unknown>)[key];
	if (typeof method === 'function') return method.call(bond) as N;
	return fallback(bond);
}

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const PopoverArrowAtom = defineAtom<OverlayView, HTMLElement>('arrow', (atom) => {
	atom.capability(popoverArrowPresentation());
});
export type PopoverArrowAtom = InstanceType<typeof PopoverArrowAtom>;

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
export type PopoverOverlayAtom = InstanceType<typeof PopoverOverlayAtom>;

// No hand-written handlers: focus-trap + escape onkeydown come from `.role('surface')`.

export const PopoverContentAtom = defineAtom<OverlayView, HTMLElement>('content', (atom) => {
	atom.capability(popoverContentPresentation());
});
export type PopoverContentAtom = InstanceType<typeof PopoverContentAtom>;

export const PopoverIndicatorAtom = defineAtom<OverlayView, HTMLElement>('indicator', (atom) => {
	atom.capability(popoverIndicatorPresentation());
});
export type PopoverIndicatorAtom = InstanceType<typeof PopoverIndicatorAtom>;

// Extends OverlayTriggerAtom with role="button" (non-button), disabled attr (button),
// Tab->focus-content, and Escape->close routing.
export const PopoverTriggerAtom = defineAtom(OverlayTriggerAtom, (atom) => {
	atom.capability(popoverTriggerPresentation());
});
export type PopoverTriggerAtom = InstanceType<typeof PopoverTriggerAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function popoverArrowPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_ARROW,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['arrow'],
			docs: 'Popover arrow presentational ARIA projection.'
		},
		behavior: {
			attrs: () => ({
				role: 'presentation',
				'aria-hidden': true
			})
		}
	});
}

function popoverOverlayPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B, HTMLElement>({
		slot: POPOVER_OVERLAY,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['overlay'],
			docs: 'Popover overlay dialog ARIA, active-state projection, and open-focus behavior.'
		},
		behavior: {
			attrs: (_node, bond) => {
				if (!bond) return {};
				// Label the dialog by the trigger, not itself (a self-reference is meaningless).
				const triggerId = getElementId(bond.id, `${bond.namespace}-trigger`);
				const isOpen = overlayIsOpen(bond);
				const isDisabled = overlayIsDisabled(bond);
				const isActive = isOpen && !isDisabled;

				return {
					role: 'dialog',
					'aria-modal': false,
					'aria-labelledby': triggerId,
					inert: !isActive ? true : undefined,
					tabindex: -1,
					'data-active': isActive
				};
			},
			onmount: (element, _node, bond) => {
				if (!bond) return;
				const triggerElement = popoverNode(bond, 'trigger')?.element as Element | undefined;
				if (!triggerElement) return;

				const isOpen = untrack(() => overlayIsOpen(bond));
				if (!isOpen) return;

				// Avoid stealing focus from inputs/textareas inside trigger.
				const activeElement = document.activeElement as HTMLElement;
				const triggerContainsFocus =
					['input', 'textarea'].includes(activeElement.tagName.toLowerCase()) &&
					triggerElement.contains(activeElement);

				if (!triggerContainsFocus) {
					setTimeout(
						() => focus(element, ['textarea:not([disabled])', 'input:not([disabled])']),
						0
					);
				}
			}
		}
	});
}

function popoverContentPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_CONTENT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['content'],
			docs: 'Popover content active-state projection.'
		},
		behavior: {
			attrs: (_node, bond) => {
				if (!bond) return {};
				const isOpen = overlayIsOpen(bond);
				const isDisabled = overlayIsDisabled(bond);
				return {
					'data-active': isOpen && !isDisabled
				};
			}
		}
	});
}

function popoverIndicatorPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_INDICATOR,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['indicator'],
			docs: 'Popover indicator live-state projection.'
		},
		behavior: {
			attrs: (_node, bond) => {
				const isOpen = bond ? overlayIsOpen(bond) : false;
				return {
					'aria-hidden': true,
					'aria-live': isOpen ? ('polite' as const) : ('off' as const)
				};
			}
		}
	});
}

function popoverTriggerPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_TRIGGER,
		meta: {
			layer: 1,
			kind: 'policy',
			projects: ['trigger'],
			docs: 'Popover trigger button semantics and keyboard routing.'
		},
		behavior: {
			attrs: (node, bond) => {
				const isButtonElement = isBrowser() ? node.element instanceof HTMLButtonElement : false;
				const isDisabled = bond ? overlayIsDisabled(bond) : false;
				return {
					role: isButtonElement ? '' : 'button',
					disabled: isButtonElement ? isDisabled : undefined
				};
			},
			handlers: (_node, bond) => ({
				onkeydown: (ev: KeyboardEvent) => {
					if (!bond || overlayIsDisabled(bond)) return;

					if (ev.key === 'Tab') {
						(popoverNode(bond, 'content')?.element as HTMLElement | undefined)?.focus();
						return;
					}

					if (ev.key === 'Escape') {
						// Trigger holds focus (not trapped in content): Escape still closes.
						closeOverlay(bond);
					}
				}
			})
		}
	});
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

// Fusion spec (§9.4.1): exposes popover's atoms + capabilities to fuse() without
// converting the generic PopoverBond to a defineBond. Pass as `{ spec: popoverSpec }`.
export const popoverSpec = {
	name: 'popover',
	base: PopoverBondBase,
	atoms: {
		trigger: PopoverTriggerAtom,
		'virtual-trigger': PopoverVirtualTriggerAtom,
		overlay: PopoverOverlayAtom,
		content: PopoverContentAtom,
		arrow: PopoverArrowAtom,
		indicator: PopoverIndicatorAtom
	},
	capabilities: popoverCapabilities
} satisfies BondSpec<
	{
		trigger: typeof PopoverTriggerAtom;
		'virtual-trigger': typeof PopoverVirtualTriggerAtom;
		overlay: typeof PopoverOverlayAtom;
		content: typeof PopoverContentAtom;
		arrow: typeof PopoverArrowAtom;
		indicator: typeof PopoverIndicatorAtom;
	},
	typeof PopoverBondBase
>;

const PopoverBondImpl = defineBond<
	{
		trigger: typeof PopoverTriggerAtom;
		'virtual-trigger': typeof PopoverVirtualTriggerAtom;
		overlay: typeof PopoverOverlayAtom;
		content: typeof PopoverContentAtom;
		arrow: typeof PopoverArrowAtom;
		indicator: typeof PopoverIndicatorAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof PopoverBondBase
>(popoverSpec);

// Propagate OverlayBond's owner context through composed families that share Popover's context.
Object.defineProperty(PopoverBondImpl, 'CONTEXT_KEYS', {
	value: [PopoverBondImpl.CONTEXT_KEY, OverlayBond.CONTEXT_KEY],
	writable: true,
	configurable: true
});

export type PopoverBond = BondOf<typeof PopoverBondImpl>;

interface PopoverBondConstructor {
	new (props: PopoverBondProps): PopoverBond;
	readonly CONTEXT_KEY: string;
	readonly CONTEXT_KEYS?: readonly string[];
	readonly spec: (typeof PopoverBondImpl)['spec'];
	get(): PopoverBond | undefined;
	getOrThrow(message?: string): PopoverBond;
	set(bond: PopoverBond): PopoverBond;
	create(props: PopoverBondProps): PopoverBond;
}

export const PopoverBond = PopoverBondImpl as unknown as PopoverBondConstructor;
