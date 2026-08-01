export interface UseCase {
	title: string;
	description: string;
}

export interface ComponentSummary {
	name: string;
	description: string;
}

export interface ComponentDocMeta {
	componentTitle: string;
	componentDescription: string;
	componentType?: 'simple' | 'compound';
	status: 'stable' | 'beta';
	packageName: string;
	importCode: string;
	breadcrumbs: { label: string; href?: string }[];
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

export interface PropsSection {
	// Tab label and markdown heading, e.g. "Alert.Root"
	label: string;
	// Tab value — auto-derived from label if absent
	value?: string;
	// Preset key shown below the tab content
	presetKey?: string;
	props: PropDefinition[];
}
