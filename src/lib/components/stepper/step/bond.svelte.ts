import { StepperBond, type IStepper } from '$ixirjs/ui/components/stepper/bond.svelte';
import { internCapabilityFactory } from '$ixirjs/ui/shared/capability/intern';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
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

const STEP_ROOT = sharedCapabilityKey<void>({ owner: '@ixirjs/step', name: 'root', version: 1 });
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

export const StepRootAtom = defineAtom<StepBondView>('root', (atom) => {
	atom.capability(stepRootPresentation());
});
export type StepRootAtom = InstanceType<typeof StepRootAtom>;

export const StepIndicatorAtom = defineAtom<StepBondView>('indicator', (atom) => {
	atom.capability(stepIndicatorPresentation());
});
export type StepIndicatorAtom = InstanceType<typeof StepIndicatorAtom>;

export const StepHeaderAtom = defineAtom<StepBondView>('header', (atom) => {
	atom.capability(stepStatusPresentation(STEP_HEADER, 'header'));
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

const stepRootPresentation = internCapabilityFactory(function stepRootPresentation() {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot: STEP_ROOT,
		meta: {
			projects: ['root'],
			docs: 'Step root status and ARIA grouping projection.'
		},
		attach: {
			attrs: (_node, bond) => ({
				'data-stepper': bond?.parent?.id ?? '',
				'data-index': bond?.props.index ?? 0,
				...stepStatusAttrs(bond),
				'aria-disabled': bond?.isDisabled,
				'aria-describedby': bond ? `step-description-${bond.id}` : undefined,
				'aria-labelledby': bond ? `step-title-${bond.id}` : undefined,
				role: 'group' as const
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
		root: StepRootAtom,
		indicator: StepIndicatorAtom,
		header: StepHeaderAtom,
		title: StepTitleAtom,
		description: StepDescriptionAtom,
		body: StepBodyAtom,
		separator: StepSeparatorAtom
	}
});

export type StepBond = BondOf<typeof StepBond>;
