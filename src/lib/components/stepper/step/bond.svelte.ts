import { StepperBond, type IStepper } from '$ixirjs/ui/components/stepper/bond.svelte';
import { internCapabilityFactory, lazyCapability } from '$ixirjs/ui/shared/capability/intern';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { labelledControl } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { partCapability, type SharedCapabilityKeyId } from '$ixirjs/ui/shared/capability';

export type StepBondProps = BondStateProps & {
	index: number;
	disabled: boolean;
	completed: boolean;
	optional?: boolean;
	error: boolean;
};

export const StepIndicatorAtom = defineAtom<StepBondBase>('indicator', {
	slot: '@ixirjs/step:indicator',
	docs: 'Step indicator current-step and status projection.',
	attrs: (_node, bond) => ({
		'aria-current': bond?.isActive ? ('step' as const) : undefined,
		...stepStatusAttrs(bond),
		role: 'presentation' as const
	})
});

// The header is the step's rendered container, so the group semantics and the label linkage live
// here. They were declared on Step.Root, which renders no element of its own — see the note on
// `atom: false` in step-root.svelte.
export const StepHeaderAtom = defineAtom<StepBondBase>('header', (atom) => {
	atom.capability(stepStatusPresentation('@ixirjs/step:header', 'header'));
	atom.capability(stepHeaderGrouping());
});

export const StepTitleAtom = defineAtom<StepBondBase>('title');

export const StepDescriptionAtom = defineAtom<StepBondBase>('description');

export const StepBodyAtom = defineAtom<StepBondBase>('body', (atom) => {
	atom.capability(stepStatusPresentation('@ixirjs/step:body', 'body'));
});

export const StepSeparatorAtom = defineAtom<StepBondBase>('separator', {
	slot: '@ixirjs/step:separator',
	docs: 'Step separator presentation and status projection.',
	attrs: (_node, bond) => ({
		'aria-hidden': 'true',
		role: 'presentation' as const,
		...stepStatusAttrs(bond)
	})
});

const stepHeaderGrouping = lazyCapability(() =>
	partCapability<StepBondBase>(
		'@ixirjs/step:header-group',
		'header',
		'Step header grouping and disabled projection.',
		{
			// aria-labelledby / aria-describedby are NOT written here: labelledControl projects them
			// onto role:'control' from the node registry, so a consumer id on Step.Title is followed.
			attrs: (_node, bond) => ({
				role: 'group' as const,
				'aria-disabled': bond?.isDisabled
			})
		}
	)
);

// One descriptor per (slot, part) pair rather than per rendered step: surface-less, and both
// arguments are string literals, so the intern cache keys them exactly.
const stepStatusPresentation = internCapabilityFactory((id: SharedCapabilityKeyId, part: string) =>
	partCapability<StepBondBase>(id, part, `Step ${part} status projection.`, {
		attrs: (_node, bond) => stepStatusAttrs(bond)
	})
);

function stepStatusAttrs(bond: StepBondBase | undefined) {
	return {
		'data-active': bond?.isActive,
		'data-completed': bond?.isCompleted,
		'data-disabled': bond?.isDisabled,
		'data-error': bond?.props.error
	};
}

// Parent wiring and step status live on the Step bond instance.

class StepBondBase extends Bond<StepBondProps> {
	#parent?: IStepper;

	constructor(props: StepBondProps, name = 'step') {
		super(props, name);
		const stepperBond = StepperBond.get();
		if (!stepperBond) {
			throw new Error('Step must be used within a Stepper context.');
		}
		this.#parent = stepperBond;
		// Labels the step group from its own title and description atoms.
		this.capability(labelledControl());
	}

	get isActive() {
		return this.#parent?.activeStep === this.props.index;
	}

	get isCompleted() {
		const activeStep = this.#parent?.activeStep;
		return (
			this.props.completed || (typeof activeStep === 'number' && activeStep > this.props.index)
		);
	}

	get isDisabled() {
		return (
			this.props.disabled ||
			(this.#parent?.linear && this.props.index > this.#parent.activeStep + 1)
		);
	}

	get parent() {
		return this.#parent;
	}

	mount(step: StepBond) {
		return this.#parent?.mountStep(this.props.index, step);
	}

	unmount = () => {
		this.#parent?.unmountStep(this.props.index);
	};

	activate() {
		if (!this.isDisabled) {
			this.#parent?.goto(this.props.index);
		}
	}
}

export const StepBond = defineBond({
	name: 'step',
	preset: 'stepper.step',
	base: StepBondBase,
	atoms: {
		indicator: StepIndicatorAtom,
		header: { atom: StepHeaderAtom, role: 'control' },
		title: { atom: StepTitleAtom, role: 'label' },
		description: { atom: StepDescriptionAtom, role: 'description' },
		body: StepBodyAtom,
		separator: StepSeparatorAtom
	}
});

export type StepBond = BondOf<typeof StepBond>;
