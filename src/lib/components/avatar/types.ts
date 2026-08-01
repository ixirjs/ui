import type { Component } from 'svelte';
import type { PresetKey } from '$svelte-atoms/core/context/preset.svelte';

export interface AvatarProps {
	class?: string;
	preset?: PresetKey;
	src?: string | Component;
	alt?: string;
	readonly element?: HTMLElement;
	[key: string]: unknown;
}
