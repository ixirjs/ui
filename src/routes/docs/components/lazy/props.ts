import type { PropDefinition } from '$docs/types';

export const lazyOwnProps: PropDefinition[] = [
	{
		name: 'error',
		type: 'Snippet<[error: unknown]>',
		default: 'undefined',
		description:
			'Rendered when the import rejects. Give it `role="alert"`; a failed import is a real failure.'
	},
	{
		name: 'loading',
		type: 'Snippet<[]>',
		default: 'undefined',
		description:
			'Rendered while the import is in flight. Give it `role="status"` and reserve the final layout.'
	},
	{
		name: 'promise',
		type: 'Promise<Component<Props, {}, string>>',
		default: 'undefined',
		description: 'Resolves to the component to render — typically a bare `import()`.'
	}
];

export const lazyProps: PropDefinition[] = [
	{
		name: 'error',
		type: 'Snippet<[error: unknown]>',
		default: 'undefined',
		description:
			'Rendered when the import rejects. Give it `role="alert"`; a failed import is a real failure.'
	},
	{
		name: 'loading',
		type: 'Snippet<[]>',
		default: 'undefined',
		description:
			'Rendered while the import is in flight. Give it `role="status"` and reserve the final layout.'
	},
	{
		name: 'promise',
		type: 'Promise<Component<Props, {}, string>>',
		default: 'undefined',
		description: 'Resolves to the component to render — typically a bare `import()`.'
	}
];
