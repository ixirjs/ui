import { StepperBond, type IStepper } from '$ixirjs/ui/components/stepper/bond.svelte';
import { internCapabilityFactory } from '$ixirjs/ui/shared/capability/intern';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { labelledControl } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost,
	type CapabilityKey
} from '$ixirjs/ui/shared/capability';

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type StepBondView = StepBondBase;

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type StepBondProps = BondStateProps & {
	index: number;
	disabled: boolean;
	completed: boolean;
	optional?: boolean;
	error: boolean;
};

export type StepBondElements = {
	root: HTMLElement;
	indicator: HTMLElement;
	header: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	body?: HTMLElement;
	separator?: HTMLElement;
};

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const STEP_HEADER_GROUP = sharedCapabilityKey<void>({
	owner: '@ixirjs/step',
	name: 'header-group',
	version: 1
});
const STEP_INDICATOR = sharedCapabilityKey<void>({
	owner: '@ixirjs/step',
	name: 'indicator',
	version: 1
});
const STEP_HEADER = sharedCapabilityKey<void>({
	owner: '@ixirjs/step',
	name: 'header',
	version: 1
});
const STEP_BODY = sharedCapabilityKey<void>({ owner: '@ixirjs/step', name: 'body', version: 1 });
const STEP_SEPARATOR = sharedCapabilityKey<void>({
	owner: '@ixirjs/step',
	name: 'separator',
	version: 1
});

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const StepIndicatorAtom = defineAtom<StepBondView>('indicator', (atom) => {
	atom.capability(stepIndicatorPresentation());
});
export type StepIndicatorAtom = InstanceType<typeof StepIndicatorAtom>;

// The header is the step's rendered container, so the group semantics and the label linkage live
// here. They were declared on Step.Root, which renders no element of its own — see the note on
// `atom: false` in step-root.svelte.
export const StepHeaderAtom = defineAtom<StepBondView>('header', (atom) => {
	atom.capability(stepStatusPresentation(STEP_HEADER, 'header'));
	atom.capability(stepHeaderGrouping());
});
export type StepHeaderAtom = InstanceType<typeof StepHeaderAtom>;

export const StepTitleAtom = defineAtom<StepBondView>('title');
export type StepTitleAtom = InstanceType<typeof StepTitleAtom>;

export const StepDescriptionAtom = defineAtom<StepBondView>('description');
export type StepDescriptionAtom = InstanceType<typeof StepDescriptionAtom>;

export const StepBodyAtom = defineAtom<StepBondView>('body', (atom) => {
	atom.capability(stepStatusPresentation(STEP_BODY, 'body'));
});
export type StepBodyAtom = InstanceType<typeof StepBodyAtom>;

export const StepSeparatorAtom = defineAtom<StepBondView>('separator', (atom) => {
	atom.capability(stepSeparatorPresentation());
});
export type StepSeparatorAtom = InstanceType<typeof StepSeparatorAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

const stepHeaderGrouping = internCapabilityFactory(function stepHeaderGrouping() {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot: STEP_HEADER_GROUP,
		meta: {
			projects: ['header'],
			docs: 'Step header grouping and disabled projection.'
		},
		attach: {
			// aria-labelledby / aria-describedby are NOT written here: labelledControl projects them
			// onto role:'control' from the node registry, so a consumer id on Step.Title is followed.
			attrs: (_node, bond) => ({
				role: 'group' as const,
				'aria-disabled': bond?.isDisabled
			})
		}
	});
});

const stepIndicatorPresentation = internCapabilityFactory(function stepIndicatorPresentation() {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot: STEP_INDICATOR,
		meta: {
			projects: ['indicator'],
			docs: 'Step indicator current-step and status projection.'
		},
		attach: {
			attrs: (_node, bond) => ({
				'aria-current': bond?.isActive ? ('step' as const) : undefined,
				...stepStatusAttrs(bond),
				role: 'presentation' as const
			})
		}
	});
});

function stepStatusPresentation(slot: CapabilityKey<void>, part: string) {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot,
		meta: {
			projects: [part],
			docs: `Step ${part} status projection.`
		},
		attach: {
			attrs: (_node, bond) => stepStatusAttrs(bond)
		}
	});
}

const stepSeparatorPresentation = internCapabilityFactory(function stepSeparatorPresentation() {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot: STEP_SEPARATOR,
		meta: {
			projects: ['separator'],
			docs: 'Step separator presentation and status projection.'
		},
		attach: {
			attrs: (_node, bond) => ({
				'aria-hidden': 'true',
				role: 'presentation' as const,
				...stepStatusAttrs(bond)
			})
		}
	});
});

function stepStatusAttrs(bond: StepBondView | undefined) {
	return {
		'data-active': bond?.isActive,
		'data-completed': bond?.isCompleted,
		'data-disabled': bond?.isDisabled,
		'data-error': bond?.props.error
	};
}

// Parent wiring and step status live on the Step bond instance.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

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
