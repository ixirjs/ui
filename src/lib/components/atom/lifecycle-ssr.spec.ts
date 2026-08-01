import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createLifecycleKey } from './lifecycle.svelte';
import Fixture from './lifecycle-ssr-fixture.svelte';

// SSR contract: no phase fires during server render — not even `init`. Svelte's server
// rest_props copies Object.keys() only, so symbol-keyed props are dropped before reaching
// the atom (same as svelte/attachments). Phases fire on the client during hydration instead.
describe('runLifecycle — SSR', () => {
	it('server-renders with lifecycle keys: no phase fires, rest props survive', () => {
		const calls: string[] = [];
		const lifecycleProps = {
			[createLifecycleKey('init')]: () => {
				calls.push('init');
				return () => calls.push('init-cleanup');
			},
			[createLifecycleKey('mount')]: () => calls.push('mount'),
			[createLifecycleKey('destroy')]: () => calls.push('destroy')
		};

		const { body } = render(Fixture, {
			props: { lifecycleProps, 'data-ssr': 'yes', class: 'ssr-class' }
		});

		expect(body).toContain('hello-ssr');
		expect(body).toContain('data-ssr="yes"');
		// Symbols never survive Svelte's server rest_props — lifecycle is client-only.
		expect(calls).toEqual([]);
	});

	it('server-renders the zero-key fast path untouched', () => {
		const { body } = render(Fixture, { props: { 'data-plain': 'ok' } });
		expect(body).toContain('hello-ssr');
		expect(body).toContain('data-plain="ok"');
	});
});
