import { mount as mountComponent, unmount, flushSync } from 'svelte';
import Fixture from '../../../../src/lib/test/perf/workloads/customization.test.svelte';
import '../../../../src/app.css';
export async function sample(n, scenario) {
	if (!['default', 'static', 'merged', 'reactive', 'selection', 'motion'].includes(scenario))
		throw Error('unknown scenario');
	const target = document.createElement('div');
	document.body.append(target);
	const start = performance.now();
	const app = mountComponent(Fixture, { target, props: { n, scenario } });
	flushSync();
	const mount = performance.now() - start;
	try {
		const buttons = target.querySelectorAll('button');
		if (buttons.length !== n || parseFloat(getComputedStyle(buttons[0]).paddingLeft) <= 0)
			throw Error('missing styled buttons');
		if (['static', 'merged'].includes(scenario) && buttons[0].dataset.theme !== 'static')
			throw Error('missing theme');
		if (scenario === 'merged' && buttons[0].dataset.layer !== 'second')
			throw Error('missing layer');
		buttons[0].click();
		flushSync();
		if (app.snapshot().clicks !== 1) throw Error('missing callback');
		const updated = performance.now();
		app.update();
		flushSync();
		const update = performance.now() - updated;
		if (![...buttons].every((b) => b.classList.contains('benchmark-after')))
			throw Error('missing update');
		if (scenario === 'reactive' && buttons[0].dataset.phase !== 'after')
			throw Error('stale factory');
		await app.settled();
		if (scenario === 'selection' && app.snapshot().selected !== n) throw Error('missing selection');
		if (scenario === 'motion' && app.snapshot().animations !== n) throw Error('missing motion');
		return { mount, update, html: target.innerHTML };
	} finally {
		await unmount(app);
		target.remove();
	}
}

let held;
export async function hold(n, scenario) {
	if (held) throw Error('already mounted');
	const target = document.createElement('div');
	document.body.append(target);
	const app = mountComponent(Fixture, { target, props: { n, scenario } });
	flushSync();
	held = { app, target };
	if (target.querySelectorAll('button').length !== n) throw Error('missing nodes');
	await app.settled();
}
export async function release() {
	if (!held) throw Error('not mounted');
	await unmount(held.app);
	held.target.remove();
	held = undefined;
}
