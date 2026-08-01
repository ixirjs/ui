import type { Component } from 'svelte';
import type { HtmlAtomProps } from '$ixirjs/ui/components/atom';

export interface AvatarProps extends HtmlAtomProps<'div'> {
	src?: string | Component;
	alt?: string;
	readonly element?: HTMLElement;
}
