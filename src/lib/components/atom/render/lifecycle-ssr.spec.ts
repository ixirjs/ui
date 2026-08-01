import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createLifecycleKey } from './lifecycle.svelte';
import Fixture from '$ixirjs/ui/test/components/atom/lifecycle-ssr-fixture.test.svelte';

// SSR contract: no symbol-keyed phase fires during server render. Svelte's server rest_props
// copies Object.keys() only, so symbol-keyed props are dropped before reaching the atom (same as
// svelte/attachments). mount/destroy fire on the client during hydration instead; init-time logic
// runs server-side only via the string-keyed `oninit` prop (covered below).
describe('runLifecycle — SSR', () => {
	it('server-renders with lifecycle keys: no phase fires, rest props survive', () => {
		const calls: string[] = [];
		const lifecycleProps = {
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

	// `oninit` is the string-keyed escape hatch: it survives server rest_props, so init logic
	// runs during server render. Its cleanup is not invoked on the server (no teardown there).
	it('runs oninit during SSR (string-keyed channel survives server rest_props)', () => {
		const calls: string[] = [];
		const { body } = render(Fixture, {
			props: {
				'data-ssr': 'yes',
				oninit: () => {
					calls.push('init');
					return () => calls.push('init-cleanup');
				}
			}
		});

		expect(body).toContain('hello-ssr');
		// Fired synchronously on the server; cleanup stays pending for client teardown only.
		expect(calls).toEqual(['init']);
	});
});
