export { resolvePreset } from './preset';
export { isSnippetBase } from '$ixirjs/ui/kernel/render/render-target';
export { mergeClassesWithPreset } from './classes';
export {
	resolveVariants,
	mergeVariants,
	resolveLocalVariants,
	variantSelectorKeys
} from './variants';
// The implementation lives in shared so authoring helpers use the same presentation seam without a
// shared → component dependency. Re-exported directly; there is no component-side wrapper module.
export { mergeAtomProps, mergePresetProps } from '$ixirjs/ui/kernel/resolve/presentation-props';
export { foldPresentation, type FoldedPresentation } from './fold';
export type { ResolvedProps } from './cache';
