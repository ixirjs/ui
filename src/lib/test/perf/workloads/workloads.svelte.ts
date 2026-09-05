import '../../../../app.css';
import { flushSync, mount, unmount, hydrate } from 'svelte';
import Positioning from './positioning.test.svelte';
import ExpandedTree from '../vs-shadcn/ixir-tree.test.svelte';
import Fixture, { SCENARIOS } from './customization.test.svelte';
import IxirButton from '../vs-shadcn/ixir-button.test.svelte';
import ShadcnButton from '../vs-shadcn/shadcn-button.test.svelte';
import { assertButtons } from '../vs-shadcn/parity';
import { validateSampling } from '../samples';

export { SCENARIOS };
const frame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
const assert = (condition: unknown, message: string) => {
	if (!condition) throw new Error(message);
};

/** Styled end-to-end own-cost scenarios, NOT competitor throughput. Includes animation settling. */
export async function run(scenario: (typeof SCENARIOS)[number], n = 100, rounds = 7, warmup = 3) {
	if (!SCENARIOS.includes(scenario)) throw new Error(`unknown styled workload: ${scenario}`);
	if (!Number.isSafeInteger(n) || n <= 0) throw new Error('invalid workload count');
	validateSampling(rounds, warmup);
	const samples = [];
	for (let round = 0; round < rounds; round++) {
		const target = document.createElement('div');
		document.body.append(target);
		const frames: number[] = [];
		let previous = await frame();
		let handle = 0;
		const observe = (now: number) => {
			frames.push(now - previous);
			previous = now;
			handle = requestAnimationFrame(observe);
		};
		handle = requestAnimationFrame(observe);
		const started = performance.now();
		const app = mount(Fixture, { target, props: { scenario, n } });
		try {
			flushSync();
			await app.settled();
			await frame();
			await frame();
			const mountSettled = performance.now() - started;
			const buttons = target.querySelectorAll('button');
			assert(buttons.length === n, 'styled workload cardinality');
			const style = getComputedStyle(buttons[0]!);
			assert(
				parseFloat(style.paddingLeft) > 0 && style.boxSizing === 'border-box',
				'application CSS missing'
			);
			assert(buttons[0]!.getBoundingClientRect().height > 0, 'styled workload has no geometry');
			if (scenario === 'static' || scenario === 'merged')
				assert(buttons[0]!.dataset.theme === 'static', 'static theme missing');
			if (scenario === 'merged')
				assert(buttons[0]!.dataset.layer === 'second', 'merged layer missing');
			if (scenario === 'variants') assert(buttons[0]!.dataset.tone === 'hot', 'variant missing');
			if (scenario === 'reactive')
				assert(buttons[0]!.dataset.phase === 'before', 'initial reactive theme missing');
			buttons[0]!.click();
			flushSync();
			assert(app.snapshot().clicks === 1, 'click callback missing');
			const updated = performance.now();
			app.update();
			flushSync();
			await app.settled();
			await frame();
			await frame();
			const updateSettled = performance.now() - updated;
			assert(
				[...buttons].every((button) => button.classList.contains('benchmark-after')),
				'class update missing'
			);
			if (scenario === 'reactive')
				assert(buttons[0]!.dataset.phase === 'after', 'reactive theme stale');
			if (scenario === 'selection') {
				assert(app.snapshot().selected === n, 'bulk selection missing');
				assert(
					[...buttons].every((button) => button.getAttribute('aria-pressed') === 'true'),
					'selection ARIA stale'
				);
			}
			if (scenario === 'motion')
				assert(app.snapshot().animations === n, 'motion driver count mismatch');
			if (round >= warmup)
				samples.push({ mountSettled, updateSettled, frameIntervals: [...frames] });
		} finally {
			cancelAnimationFrame(handle);
			await unmount(app);
			target.remove();
		}
		await frame();
		assert(document.getAnimations().length === 0, 'animation leaked after teardown');
	}
	return {
		scenario,
		n,
		rounds,
		warmup,
		samples,
		classification: 'styled own-cost; frame waits included; no competitor claim'
	};
}

/** The same observations must hold for both implementations and both creation paths. */
export async function verifyButtons(ssr: Record<string, string>) {
	for (const [side, component] of [
		['ixir', IxirButton],
		['shadcn', ShadcnButton]
	] as const) {
		if (!ssr[side]) throw new Error(`missing button SSR: ${side}`);
		for (const hydrating of [false, true]) {
			const target = document.createElement('div');
			document.body.append(target);
			let clicks = 0;
			const props = $state({
				n: 2,
				tint: '',
				bump: '',
				onpress: () => {
					clicks++;
				}
			});
			if (hydrating) target.innerHTML = ssr[side]!;
			const app = hydrating
				? hydrate(component, { target, props })
				: mount(component, { target, props });
			try {
				flushSync();
				assertButtons(target, 2);
				target.querySelector('button')!.click();
				assert(clicks === 1, 'consumer click handler did not run exactly once');
				props.tint = 'parity-tint';
				props.bump = 'parity-probe';
				flushSync();
				assertButtons(target, 2, props.tint, props.bump);
			} finally {
				await unmount(app);
				target.remove();
			}
		}
	}
	return 'button mount/hydrate/text/type/click/class-update assertions passed on both sides';
}

/** Positioning must settle after a reactive offset change and release its portal on teardown. */
export async function verifyPositioning() {
	const target = document.createElement('div');
	document.body.append(target);
	const app = mount(Positioning, { target });
	const until = async (predicate: () => boolean) => {
		const deadline = performance.now() + 3000;
		while (!predicate()) {
			if (performance.now() > deadline) throw new Error('positioning did not settle');
			await frame();
		}
	};
	try {
		flushSync();
		await until(() => !!target.querySelector('[data-bench-content]'));
		await frame();
		await frame();
		const content = target.querySelector<HTMLElement>('[data-bench-content]')!;
		assert(content.getBoundingClientRect().height > 0, 'positioned content has no geometry');
		const before = content.getBoundingClientRect().top;
		app.move();
		flushSync();
		await until(() => Math.abs(content.getBoundingClientRect().top - before) > 10);
		app.close();
		flushSync();
		// Popover retains its closed DOM; invisibility and inertness, not removal, are its contract.
		await until(() => content.dataset.state === 'closed' && !!content.closest('[inert]'));
		await frame();
		await Promise.all(document.getAnimations().map((animation) => animation.finished));
		assert(
			getComputedStyle(content.closest<HTMLElement>('[inert]')!).opacity === '0',
			'closed overlay remains visible'
		);
	} finally {
		await unmount(app);
		target.remove();
	}
	await frame();
	assert(!document.querySelector('[data-bench-content]'), 'positioned portal leaked');
	return 'styled positioning, offset update, close and portal teardown assertions passed';
}

/** Expanded breadth is separate from the existing depth-growth fixture. */
export async function verifyExpandedTree(n = 100) {
	const target = document.createElement('div');
	document.body.append(target);
	const started = performance.now();
	const app = mount(ExpandedTree, { target, props: { n } });
	try {
		flushSync();
		await frame();
		await frame();
		const items = target.querySelectorAll<HTMLElement>('[role="treeitem"]');
		assert(items.length === n + 2, 'expanded tree cardinality');
		items[0]!.focus();
		items[0]!.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		);
		flushSync();
		assert(document.activeElement === items[1], 'expanded tree navigation failed');
		return {
			n,
			mountAndNavigationSettled: performance.now() - started,
			classification: 'styled expanded-tree smoke; not a comparative latency sample'
		};
	} finally {
		await unmount(app);
		target.remove();
	}
}
