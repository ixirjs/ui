import { StepperBond, type IStepper } from '../bond.svelte';
import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';

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

const STEP_ROOT = sharedCapabilityKey<void>('@svelte-atoms/step:root');
const STEP_INDICATOR = sharedCapabilityKey<void>('@svelte-atoms/step:indicator');
const STEP_HEADER = sharedCapabilityKey<void>('@svelte-atoms/step:header');
const STEP_BODY = sharedCapabilityKey<void>('@svelte-atoms/step:body');
const STEP_SEPARATOR = sharedCapabilityKey<void>('@svelte-atoms/step:separator');

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

function stepRootPresentation() {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot: STEP_ROOT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['root'],
			docs: 'Step root status and ARIA grouping projection.'
		},
		behavior: {
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
}

function stepIndicatorPresentation() {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot: STEP_INDICATOR,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['indicator'],
			docs: 'Step indicator current-step and status projection.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				'aria-current': bond?.isActive ? ('step' as const) : undefined,
				...stepStatusAttrs(bond),
				role: 'presentation' as const
			})
		}
	});
}

function stepStatusPresentation(slot: symbol, part: string) {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: [part],
			docs: `Step ${part} status projection.`
		},
		behavior: {
			attrs: (_node, bond) => stepStatusAttrs(bond)
		}
	});
}

function stepSeparatorPresentation() {
	return defineAtomCapability<void, AtomHost, StepBondView>({
		slot: STEP_SEPARATOR,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['separator'],
			docs: 'Step separator presentation and status projection.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				'aria-hidden': 'true',
				role: 'presentation' as const,
				...stepStatusAttrs(bond)
			})
		}
	});
}

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

const StepBondImpl = defineBond<
	{
		root: typeof StepRootAtom;
		indicator: typeof StepIndicatorAtom;
		header: typeof StepHeaderAtom;
		title: typeof StepTitleAtom;
		description: typeof StepDescriptionAtom;
		body: typeof StepBodyAtom;
		separator: typeof StepSeparatorAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof StepBondBase
>({
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

export type StepBond = BondOf<typeof StepBondImpl>;

interface StepBondConstructor {
	new (props: StepBondProps): StepBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof StepBondImpl)['spec'];
	get(): StepBond | undefined;
	getOrThrow(message?: string): StepBond;
	set(bond: StepBond): StepBond;
	create(props: StepBondProps): StepBond;
}

export const StepBond = StepBondImpl as unknown as StepBondConstructor;
