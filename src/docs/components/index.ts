export { default as PageHeader } from './page-header.svelte';
export { default as Breadcrumb } from './breadcrumb.svelte';
export * from './section';
export { default as Installation } from './import-code.svelte';
export { default as FeatureGrid } from './feature-grid.svelte';
export { default as AccessibilityInfo } from './accessibility-info.svelte';
export { default as PageNavigation } from './page-navigation.svelte';
export { default as DemoExample } from './demo-example.svelte';
export { default as Props } from '../props-datagrid.svelte';
export { default as LLMAccess } from './llm-access.svelte';
export { default as CodeBlock } from './code-block.svelte';
export { default as DocCallout } from './callout.svelte';
// ── Dual-mode doc primitives ──────────────────────────────────────────────
export { default as DocPage } from './doc-page.svelte';
export { default as DocSection } from './doc-section.svelte';
export { default as DocExample } from './doc-example.svelte';
export { default as DocProps } from './doc-props.svelte';
export { default as DocCalloutBlock } from './doc-callout.svelte';
export { default as DocOnly } from './doc-only.svelte';
export { default as DocInstallation } from './doc-installation.svelte';
export { default as DocAccessibility } from './doc-accessibility.svelte';
export { default as DocCode } from './doc-code.svelte';
// ── Composable page templates ─────────────────────────────────────────────
export { default as DocComponentPage } from './doc-component-page.svelte';
export { default as DocPropsSection } from './doc-props-section.svelte';
export { default as DocPropsTabs } from './doc-props-tabs.svelte';
export type { ComponentDocMeta, UseCase, ComponentSummary, PropsSection } from '$docs/types';
export { getDocMode, setDocMode } from '../context/doc-mode.svelte';
