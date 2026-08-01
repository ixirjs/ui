import { Bond, Atom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared/authoring/define.svelte';
import { capabilityKey, defineCapability } from '$ixirjs/ui/shared/capability/capability';
import {
	createDisclosure,
	disclosureCapability,
	disclosureClose,
	type Disclosure
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import type { DisclosureStateProps } from '$ixirjs/ui/shared/capability/models/disclosure-state.svelte';
import { labelledControl } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type ToastBondProps = DisclosureStateProps & {
	dismissible?: boolean;
	duration?: number;
};

export type ToastBondElements = {
	root: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	close: HTMLElement;
};

// Minimal bond view for atoms — avoids atom↔bond circularity through defineBond.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type ToastBondView = ToastBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class ToastRootAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		const props = this.requireBond()?.props;
		const isOpen = props?.open ?? false;
		const isDisabled = props?.disabled ?? false;

		// aria-labelledby/describedby come from labelledControl (role:'control'); emitted when those atoms exist.
		return {
			...super.attrs,
			role: 'status',
			'aria-live': 'polite',
			'aria-atomic': 'true',
			'aria-disabled': isDisabled ? 'true' : 'false',
			'data-open': isOpen,
			'data-state': isOpen ? 'open' : 'closed'
		};
	}
}

export class ToastTitleAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'title');
	}
	// id is the default atom id (`toast-title-${bond.id}`), registered via .role('label').
}

export class ToastDescriptionAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'description');
	}
	// id is the default atom id (`toast-description-${bond.id}`), registered via .role('description').
}

export class ToastCloseAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'close');
	}

	override get attrs() {
		return {
			...super.attrs,
			'aria-label': 'Dismiss notification'
		};
	}
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

const TOAST_TIMEOUT = capabilityKey('@ixirjs/toast-timeout');

const toastTimeoutCapability = defineCapability({
	slot: TOAST_TIMEOUT,
	meta: { docs: 'Closes an open toast after its configured duration.' },
	setup: (bond) => {
		const toast = bond as ToastBondBase;
		$effect(() => {
			const duration = toast.props.duration ?? 0;
			if (!toast.isOpen || duration <= 0) return;
			const handle = setTimeout(() => {
				toast.stageOpenChange({ reason: 'timeout' });
				toast.close();
			}, duration);
			return () => clearTimeout(handle);
		});
	}
});

class ToastBondBase extends Bond<ToastBondProps> {
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;
	// Storage stays in props.open.
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: ToastBondProps, name = 'toast') {
		super(props, name);
		// Live-region labelling, dismiss activation. Declared here rather than behind a recipe:
		// toast is the only caller, so the recipe only hid which three capabilities are in play.
		this.registerCapabilities([
			disclosureCapability(this.disclosure),
			labelledControl(),
			disclosureClose({
				disabled: (bond) => (bond as ToastBondBase).props.dismissible === false,
				stopPropagation: true
			})
		]);
		this.capability(toastTimeoutCapability);
	}

	stageOpenChange(context: Pick<StateChangeContext, 'event' | 'reason'>): void {
		this.#openChangeContext = context;
		queueMicrotask(() => {
			if (this.#openChangeContext === context) this.#openChangeContext = undefined;
		});
	}

	takeOpenChangeContext(): Pick<StateChangeContext, 'event' | 'reason'> {
		const context = this.#openChangeContext ?? {};
		this.#openChangeContext = undefined;
		return context;
	}

	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}

	get isDisabled() {
		return this.props.disabled;
	}

	// `disabled` is the bond's own guard, layered around the shared disclosure.
	open() {
		if (this.props.disabled) return;
		this.disclosure.open();
	}

	close() {
		this.disclosure.close();
	}

	toggle() {
		if (this.props.disabled) return;
		this.disclosure.toggle();
	}
}

// Toast bond via defineBond: the declaration maps the dismiss slot to the close part and role.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const ToastBond = defineBond({
	name: 'toast',
	base: ToastBondBase,
	atoms: {
		root: { atom: ToastRootAtom, role: 'control' },
		title: { atom: ToastTitleAtom, role: 'label' },
		description: { atom: ToastDescriptionAtom, role: 'description' },
		dismiss: { atom: ToastCloseAtom, part: 'close', role: 'close' }
	}
});

// ToastBond works as both value (new ToastBond(state)) and type (ToastBond | undefined).
export type ToastBond = BondOf<typeof ToastBond>;
