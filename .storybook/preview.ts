import type { Preview } from '@storybook/svelte';
import StoryRoot from '../src/stories/StoryRoot.svelte';
import './global.css';
import '../src/app.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo'
		}
	},
	// Global color-scheme toggle in the Storybook toolbar. 'system' follows the OS
	// preference (colorScheme() rune); 'light'/'dark' force an explicit scheme.
	initialGlobals: {
		colorScheme: 'system'
	},
	globalTypes: {
		colorScheme: {
			description: 'Color scheme',
			toolbar: {
				icon: 'circlehollow',
				items: [
					{ value: 'system', icon: 'browser', title: 'System' },
					{ value: 'light', icon: 'sun', title: 'Light' },
					{ value: 'dark', icon: 'moon', title: 'Dark' }
				],
				dynamicTitle: true
			}
		}
	},
	decorators: [
		(story, context) => ({
			Component: StoryRoot,
			props: {
				story,
				colorScheme: context.globals.colorScheme
			}
		})
	]
};

export default preview;
