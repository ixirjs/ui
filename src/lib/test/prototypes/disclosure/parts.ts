import type { DisclosureBond } from './bond';

type DisclosureView = Pick<DisclosureBond, 'isOpen' | 'isDisabled' | 'toggle'>;

/** This role knows no family class, preset, renderer, context or component lifecycle. */
export function disclosureTrigger(
	bond: DisclosureView,
	options: {
		id: string;
		controls(): string | undefined;
		activation(): 'native-button' | 'non-native';
	}
) {
	const onclick = (event: MouseEvent) => {
		if (event.defaultPrevented || bond.isDisabled) return;
		bond.toggle({ event, reason: 'trigger' });
	};
	const onkeydown = (event: KeyboardEvent) => {
		if (event.defaultPrevented || bond.isDisabled) return;
		// A native button synthesizes click for Enter/Space; never toggle twice.
		if (options.activation() === 'native-button') return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		bond.toggle({ event, reason: 'trigger' });
	};

	return {
		attrs: () => {
			const native = options.activation() === 'native-button';
			const disabled = bond.isDisabled;
			return {
				id: options.id,
				type: native ? ('button' as const) : undefined,
				role: native ? undefined : 'button',
				tabindex: native ? undefined : disabled ? -1 : 0,
				disabled: native ? disabled || undefined : undefined,
				'aria-disabled': disabled ? ('true' as const) : ('false' as const),
				'aria-controls': options.controls(),
				'aria-expanded': bond.isOpen,
				'data-state': bond.isOpen ? 'open' : 'closed',
				onclick,
				onkeydown
			};
		}
	};
}

/** Region semantics are explicit; this is not a universal overlay-content projection. */
export function disclosureRegion(
	bond: Pick<DisclosureBond, 'isOpen'>,
	options: { id: string; labelledBy(): string | undefined }
) {
	return {
		attrs: () => ({
			id: options.id,
			role: 'region',
			'aria-labelledby': options.labelledBy(),
			'data-state': bond.isOpen ? 'open' : 'closed',
			inert: bond.isOpen ? undefined : true
		})
	};
}
