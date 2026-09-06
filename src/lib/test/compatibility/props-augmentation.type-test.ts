import type { ButtonProps } from '@ixirjs/ui/components/button';
import type { BreadcrumbRootProps } from '@ixirjs/ui/components/breadcrumb';
import type { CollapsibleRootProps } from '@ixirjs/ui/components/collapsible';
import type { ContextMenuItemProps } from '@ixirjs/ui/components/context-menu';
import type { FormRootProps } from '@ixirjs/ui/components/form';
import type { TeleportProps } from '@ixirjs/ui/components/portal';
import type { TreeRootProps } from '@ixirjs/ui/components/tree';

/**
 * Consumers type preset-driven props (`variant`, `size`, …) themselves, because a preset is
 * swappable: the library cannot know which values an application's own preset defines. Two routes
 * exist, and both must keep working — this is the props-side counterpart of
 * `preset-augmentation.type-test.ts`.
 *
 * A. Interface-shaped props are augmented directly.
 * B. Type-alias props expose an `*ExtendProps` interface, because a type alias cannot be merged.
 *
 * `auditTag` stands in for a real application prop; a name no shipped component uses keeps this
 * file from perturbing the rest of the repo's typecheck.
 */

// A. Interface-shaped props — augment the props interface itself.
declare module '@ixirjs/ui/components/button' {
	interface ButtonProps {
		auditTag?: 'alpha' | 'beta';
	}
}

// B. Type-alias props — augment the family's ExtendProps seam.
declare module '@ixirjs/ui/components/breadcrumb' {
	interface BreadcrumbRootExtendProps {
		auditTag?: 'alpha' | 'beta';
	}
}

declare module '@ixirjs/ui/components/collapsible' {
	interface CollapsibleRootExtendProps {
		auditTag?: 'alpha' | 'beta';
	}
}

declare module '@ixirjs/ui/components/context-menu' {
	interface ContextMenuItemExtendProps {
		auditTag?: 'alpha' | 'beta';
	}
}

declare module '@ixirjs/ui/components/form' {
	interface FormRootExtendProps {
		auditTag?: 'alpha' | 'beta';
	}
}

declare module '@ixirjs/ui/components/portal' {
	interface TeleportExtendProps {
		auditTag?: 'alpha' | 'beta';
	}
}

declare module '@ixirjs/ui/components/tree' {
	interface TreeRootExtendProps {
		auditTag?: 'alpha' | 'beta';
	}
}

// The augmented prop is accepted on every family.
const accepted = [
	{ auditTag: 'alpha' } satisfies ButtonProps,
	{ auditTag: 'alpha' } satisfies BreadcrumbRootProps,
	{ auditTag: 'alpha' } satisfies CollapsibleRootProps,
	{ auditTag: 'alpha' } satisfies ContextMenuItemProps,
	{ auditTag: 'alpha' } satisfies FormRootProps,
	{ auditTag: 'alpha' } satisfies TeleportProps,
	{ auditTag: 'alpha' } satisfies TreeRootProps
];

// A value outside the augmented union is rejected — the reason consumers declare these at all.
// @ts-expect-error 'gamma' is not in the augmented union
const badButton = { auditTag: 'gamma' } satisfies ButtonProps;
// @ts-expect-error 'gamma' is not in the augmented union
const badBreadcrumb = { auditTag: 'gamma' } satisfies BreadcrumbRootProps;
// @ts-expect-error 'gamma' is not in the augmented union
const badCollapsible = { auditTag: 'gamma' } satisfies CollapsibleRootProps;
// @ts-expect-error 'gamma' is not in the augmented union
const badContextMenu = { auditTag: 'gamma' } satisfies ContextMenuItemProps;
// @ts-expect-error 'gamma' is not in the augmented union
const badForm = { auditTag: 'gamma' } satisfies FormRootProps;
// @ts-expect-error 'gamma' is not in the augmented union
const badTeleport = { auditTag: 'gamma' } satisfies TeleportProps;
// @ts-expect-error 'gamma' is not in the augmented union
const badTree = { auditTag: 'gamma' } satisfies TreeRootProps;

void accepted;
void badButton;
void badBreadcrumb;
void badCollapsible;
void badContextMenu;
void badForm;
void badTeleport;
void badTree;
