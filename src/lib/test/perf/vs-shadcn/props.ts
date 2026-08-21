/**
 * Shared fixture props for the parity set.
 *
 * `tint` and `bump` exist for the client arm and are inert on the server (both default to `''`,
 * which every side folds into the same class string it would have produced without them —
 * asserted by the SSR census being unchanged when they were introduced).
 *
 * - `tint` is read by EVERY unit: changing it is the broad-update leg, and its slope over `n` is
 *   per-unit update cost.
 * - `bump` is read by ONE probe unit rendered after the each block: changing it is the targeted
 *   leg. The probe sits outside the each on purpose — a conditional inside it (`i === 0 ? bump`)
 *   makes every item read `bump` and turns the targeted leg into a second broad one.
 */
export type FixtureProps = {
	n?: number;
	tint?: string;
	bump?: string;
};
