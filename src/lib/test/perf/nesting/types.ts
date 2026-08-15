// Shared prop shape for the nesting benchmark's two arms. Both the component
// (`nesting-level.svelte`) and the module snippet (`nesting-levels.svelte`) take exactly these
// five facts, so the only difference between the arms is the seam that carries them.
import type { Snippet } from 'svelte';

/**
 * A 2×2, because two independent choices were being conflated and each one moved the numbers more
 * than the other did.
 *
 * |                    | explicit fields    | one object packet    |
 * | ------------------ | ------------------ | -------------------- |
 * | component boundary | `component`        | `component-spread`   |
 * | module snippet     | `snippet`          | `snippet-packet`     |
 *
 * Reading a column gives the seam's cost — boundary against call — at a fixed calling convention.
 * Reading a row gives the convention's cost at a fixed seam: `spread_props` on the component side,
 * and on the snippet side an object argument whose fields all invalidate together.
 *
 * The first attempt at this benchmark had only `component` (explicit) and `snippet` (packet), and
 * so charged the snippet arm for a calling convention rather than for its seam. On SSR that read as
 * a 7× snippet win; on CSR it read as a 2.4× snippet loss on targeted updates. Both were the
 * convention, not the seam.
 */
export type NestingArm = 'component' | 'component-spread' | 'snippet' | 'snippet-packet';

/**
 * `tint` is the BROAD prop: every level renders it, so changing it invalidates the whole chain.
 * `deep` is the TARGETED prop: it is drilled through every level as a prop but rendered only by
 * the leaf, so changing it should invalidate one effect per unit no matter how deep the chain is.
 * The two legs are what separate a props proxy from a re-invoked snippet body.
 */
export type NestingLevelData = {
	depth: number;
	label: string;
	tint: string;
	deep: number;
};

/** The level's body takes the drilled `deep` value as its argument — that is what makes the
 * drilling real rather than a closure read from the fixture's own scope. */
export type NestingBody = Snippet<[number]>;

export type NestingLevelProps = NestingLevelData & { children?: NestingBody };
