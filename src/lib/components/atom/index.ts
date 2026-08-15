export * from './types';
export { componentBase, type ExplicitBase } from './render/render-target';
export { resolvePreset, mergeAtomProps, mergePresetProps } from './resolve';
export {
	createLifecycleKey,
	isLifecycleKey,
	lifecycleType,
	getLifecycleProps,
	runLifecycle,
	type LifecycleType,
	type LifecycleAttachment,
	type LifecycleProps
} from './render/lifecycle.svelte';
