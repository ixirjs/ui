import type * as Experimental from '@ixirjs/ui/experimental';
import type * as Shared from '@ixirjs/ui/shared';

/**
 * The stable/experimental split, asserted at the type level.
 *
 * Rewritten on 2026-08-27, when the Bond/Atom runtime was deleted: `/shared` used to carry
 * `defineBond`/`useRoot` and the capability protocol, and `/experimental` the concrete `Bond`,
 * `Atom` and definition types. What a family is authored with now is the element seam plus the
 * behaviour-model factories; the concrete family classes stay experimental.
 */
export type StableAuthoringTypesArePublic = [
	Shared.ElementSpec,
	Shared.KernelElement,
	Shared.Disclosure,
	Shared.DisclosureBacking,
	Shared.SelectionBacking<unknown>,
	Shared.SelectionModel<unknown>,
	Shared.RovingBacking,
	Shared.RovingFocus,
	Shared.InputField,
	Shared.InputModel
];

export type ExperimentalFamilyClassesArePublic = [
	Experimental.CardBond,
	Experimental.AccordionBond,
	Experimental.DialogBond,
	Experimental.PopoverBond,
	Experimental.SelectBond,
	Experimental.TreeBond
];

// @ts-expect-error The concrete family classes are experimental-only.
export type StableDoesNotExposeCardBond = Shared.CardBond;
// @ts-expect-error The deleted runtime is not published anywhere.
export type StableDoesNotExposeBond = Shared.Bond;
// @ts-expect-error The deleted runtime is not published anywhere.
export type ExperimentalDoesNotExposeBond = Experimental.Bond;
// @ts-expect-error The deleted runtime is not published anywhere.
export type ExperimentalDoesNotExposeAtom = Experimental.Atom;
// @ts-expect-error `defineBond` went with the Bond runtime.
export type StableDoesNotExposeDefineBond = typeof Shared.defineBond;
// @ts-expect-error `useRoot` went with the Bond runtime.
export type StableDoesNotExposeUseRoot = typeof Shared.useRoot;
