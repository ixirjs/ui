import { BondAtom } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type ViewOf, type BondOf } from '$svelte-atoms/core/shared/define-bond.svelte';
import {
	createDisclosure,
	type Disclosure
} from '$svelte-atoms/core/shared/capabilities/disclosure.svelte';
import {
	DisclosureState,
	type DisclosureStateProps
} from '$svelte-atoms/core/shared/capabilities/disclosure-state.svelte';
import { labelledControl } from '$svelte-atoms/core/shared/capabilities/relationship.svelte';

export type ToastBondProps = DisclosureStateProps;

export type ToastBondElements = {
	root: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	close: HTMLElement;
};

// Minimal bond view for atoms — avoids atom↔bond circularity through defineBond. See §12.2.
type ToastBondView = ViewOf<ToastBondState>;

export class ToastRootAtom extends BondAtom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		const props = this.bond.state?.props;
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

export class ToastTitleAtom extends BondAtom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'title');
	}
	// id is the default atom id (`toast-title-${bond.id}`), registered via .role('label').
}

export class ToastDescriptionAtom extends BondAtom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'description');
	}
	// id is the default atom id (`toast-description-${bond.id}`), registered via .role('description').
}

export class ToastCloseAtom extends BondAtom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'close');
	}

	override get attrs() {
		const isButton = (this.element as any)?.tagName?.toLowerCase() === 'button';
		return {
			...super.attrs,
			type: isButton ? 'button' : undefined,
			role: isButton ? undefined : 'button',
			tabindex: isButton ? undefined : 0,
			'aria-label': 'Dismiss notification'
		};
	}

	override get handlers() {
		return {
			onclick: (ev: MouseEvent) => {
				ev.stopPropagation();
				this.bond.state.close();
			},
			onkeydown: (ev: KeyboardEvent) => {
				if (ev.key === 'Enter' || ev.key === ' ') {
					ev.preventDefault();
					this.bond.state.close();
				}
			}
		};
	}
}

// Toast bond via defineBond (§12): roles, key alias dismiss↔close, labelledControl capability — all generated.
export const ToastBond = defineBond<
	{
		root: { atom: typeof ToastRootAtom; role: 'control' };
		title: { atom: typeof ToastTitleAtom; role: 'label' };
		description: { atom: typeof ToastDescriptionAtom; role: 'description' };
		dismiss: { atom: typeof ToastCloseAtom; key: 'close' };
	},
	ToastBondState
>({
	name: 'toast',
	atoms: {
		root: { atom: ToastRootAtom, role: 'control' },
		title: { atom: ToastTitleAtom, role: 'label' },
		description: { atom: ToastDescriptionAtom, role: 'description' },
		dismiss: { atom: ToastCloseAtom, key: 'close' }
	},
	// a11y link (§11.3): root→aria-labelledby (title) + aria-describedby (description) via role registry.
	capabilities: () => [labelledControl()]
});

// ToastBond works as both value (new ToastBond(state)) and type (ToastBond | undefined). See §12.2.
export type ToastBond = BondOf<typeof ToastBond>;

export class ToastBondState<
	Props extends ToastBondProps = ToastBondProps
> extends DisclosureState<Props> {
	// Storage stays in props.open. isOpen/close inherited; open/toggle override to add the disabled guard.
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	get isDisabled() {
		return this.props.disabled;
	}

	// `disabled` is the bond's own guard, layered around the shared disclosure.
	open() {
		if (this.props.disabled) return;
		this.disclosure.open();
	}

	toggle() {
		if (this.props.disabled) return;
		this.disclosure.toggle();
	}
}
