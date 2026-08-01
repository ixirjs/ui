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
	decorators: [
		(story) => ({
			Component: StoryRoot,
			props: {
				story
			}
		})
	]
};

export default preview;
