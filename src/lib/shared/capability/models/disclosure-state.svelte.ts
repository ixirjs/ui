import type { BondStateProps } from '$ixirjs/ui/shared/bond/types';

/** Shared props for disclosure-backed component Bonds. */
export type DisclosureStateProps = BondStateProps & {
	open: boolean;
	disabled: boolean;
	readonly rest?: Record<string, unknown>;
};
