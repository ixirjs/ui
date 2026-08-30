export * as Drawer from './atoms';
export {
	clickoutDrawer,
	closeDrawer,
	openDrawer,
	drawer,
	toggleDrawer
} from './attachments.svelte';
export { DrawerBond, DrawerContext, type DrawerBondProps } from './bond.svelte';

export * from './attachments.svelte';

export * from './motion.svelte';

export * from './types';

// The same parts, named directly. `<Drawer.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as DrawerRoot } from './drawer-root.svelte';
export { default as DrawerContent } from './drawer-content.svelte';
export { default as DrawerBody } from './drawer-body.svelte';
export { default as DrawerHeader } from './drawer-header.svelte';
export { default as DrawerFooter } from './drawer-footer.svelte';
export { default as DrawerTitle } from './drawer-title.svelte';
export { default as DrawerDescription } from './drawer-description.svelte';
export { default as DrawerBackdrop } from './drawer-backdrop.svelte';
