import type { Frontmatter } from '$docs/md/frontmatter';
import type { DocMode } from '$docs/context/doc-mode.svelte';
import type { ExampleFn } from '$docs/utils/example-loader';

/**
 * Props of every `docs/components/<name>/content.svelte`.
 *
 * `ex` comes from whichever path renders the page — `+page.ts`, the `llms.txt` handler, the MCP doc
 * source. Required, not defaulted: a path that forgets it should fail, not render empty code blocks.
 */
export interface DocContentProps {
	contentType?: DocMode;
	ex: ExampleFn;
}

export interface UseCase {
	title: string;
	description: string;
}

export interface ComponentSummary {
	name: string;
	description: string;
}

/** Index categories, in the order the catalog page lists them. */
export const COMPONENT_CATEGORIES = [
	'Form',
	'Display',
	'Layout',
	'Navigation',
	'Overlay',
	'Feedback',
	'Utility'
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export interface ComponentDocMeta {
	/** `<title>` for the page head. Read by `docs/components/[component]/+page.svelte`. */
	title: string;
	/** `<meta name="description">` for the page head. Longer than `summary`. */
	description: string;
	componentTitle: string;
	componentDescription: string;
	/**
	 * Terse blurb for the catalog card and the sidebar — a different slot from
	 * `componentDescription`, which is the page subtitle and runs longer.
	 */
	summary: string;
	/** Groups the component on `/docs/components`. */
	category: ComponentCategory;
	componentType?: 'simple' | 'compound';
	status: 'stable' | 'beta';
	packageName: string;
	importCode: string;
	/**
	 * Derived from `componentTitle` by the registry; a page only declares this to override the
	 * default `Components / <title>` trail.
	 */
	breadcrumbs?: { label: string; href?: string }[];
	/**
	 * Reading depth. The only frontmatter field a page has to state — `DocComponentPage` derives the
	 * rest from this metadata. Defaults to `beginner`; a page needing `subcategory`, `prerequisites`
	 * or `related` passes an explicit `frontmatter` prop instead.
	 */
	depth?: Frontmatter['depth'];
	presetCode?: string;
	accessibility: string[];
	useCases?: UseCase[];
	componentsSummary?: ComponentSummary[];
}

export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

// The shared row every generated family table uses for inherited rich render and element props.
export const renderPropsRow: PropDefinition = {
	name: '...renderProps',
	type: 'RenderProps',
	default: '-',
	description:
		'All rich render and HTML element props are supported. See [Styling](/docs/styling) for presets, variants, classes, and attributes.'
};

export interface PropsSection {
	// Tab label and markdown heading, e.g. "Alert.Root"
	label: string;
	// Tab value — auto-derived from label if absent
	value?: string;
	// Preset key shown below the tab content
	presetKey?: string;
	props: PropDefinition[];
}
