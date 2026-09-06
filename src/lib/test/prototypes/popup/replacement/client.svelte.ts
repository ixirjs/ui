import { flushSync, hydrate, mount, tick, unmount } from 'svelte';
import { fixtures } from './fixtures';
import { run as runGrowth } from '$ixirjs/ui/test/perf/growth/growth-client.svelte';
import { PopupBond } from './bond.svelte';
import { CollectionItemAtom, menuItem, selectItem } from './item';
import type { DropdownMenuItem } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { samples } from './ssr';

const median = (values: number[]) =>
	[...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const census = () => document.body.getElementsByTagName('*').length;

/** Production-compiled canonical roots and handles, with no constructor substitution. */
export async function run(server: ReturnType<typeof samples>, rounds = 9) {
	const rows = [];
	for (const fixture of fixtures) {
		for (const operation of ['mount', 'hydrate'] as const) {
			const times = [];
			let elements = 0;
			for (let round = -2; round < rounds; round++) {
				(globalThis as { gc?: () => void }).gc?.();
				const before = census();
				const target = document.createElement('div');
				document.body.append(target);
				// Hydrate the frozen pre-removal markup, not freshly rendered matching HTML.
				if (operation === 'hydrate')
					target.innerHTML = server.find((row) => row.name === fixture.name)!.reference.body;
				const options = { target, props: { ...fixture.props }, recover: false };
				const start = performance.now();
				const app =
					operation === 'mount'
						? mount(fixture.component, options)
						: hydrate(fixture.component, options);
				flushSync();
				const elapsed = (performance.now() - start) * 1000;
				if (fixture.getBond) {
					const bond = fixture.getBond();
					if (!(bond instanceof PopupBond)) throw new Error(`Wrong root: ${fixture.name}`);
					if (bond.profile.collection) {
						if (!bond.items.size) throw new Error(`Empty collection: ${fixture.name}`);
						for (const item of bond.items.values()) {
							if (!(item instanceof CollectionItemAtom))
								throw new Error(`Wrong handle: ${fixture.name}`);
						}
					}
				}
				elements = census() - before - 1;
				if (elements < 1) throw new Error(`Empty ${fixture.name} ${operation}`);
				await frame();
				await unmount(app);
				await tick();
				target.remove();
				if (census() !== before) throw new Error(`DOM leaked: ${fixture.name} ${operation}`);
				if (round >= 0) times.push(elapsed);
			}
			rows.push({
				name: fixture.name,
				operation,
				microseconds: median(times),
				elements
			});
		}
	}
	return rows;
}

/** Use the existing real-browser growth workloads and existing gate, without changing its baseline. */
export async function growth() {
	return { canonical: await runGrowth({ rounds: 7, only: ['dropdown-menu', 'select'] }) };
}

/** Handle construction + registration + predicate reads, not a claim about whole-row mount. */
export function handles() {
	const props = () => ({
		id: 'bench',
		open: true,
		placements: [],
		placement: 'bottom' as const,
		position: 'absolute' as const,
		offset: 2,
		values: [] as string[]
	});
	function measure<
		B extends {
			registerItem(id: string, item: DropdownMenuItem): unknown;
			typeahead: { destroy(): void };
		}
	>(create: () => B, item: (id: string, bond: B) => DropdownMenuItem & { isHighlighted: boolean }) {
		const times = [];
		let checksum = 0;
		for (let round = -5; round < 25; round++) {
			const bond = create();
			const start = performance.now();
			for (let index = 0; index < 400; index++) {
				const id = String(index);
				const handle = item(id, bond);
				bond.registerItem(id, handle);
				checksum += handle.id.length + Number(handle.isHighlighted);
			}
			const time = ((performance.now() - start) * 1000) / 400;
			bond.typeahead.destroy();
			if (bond instanceof PopupBond) bond.dispose();
			if (round >= 0) times.push(time);
		}
		return { microseconds: median(times), checksum };
	}
	return {
		menu: {
			canonical: measure(
				() => PopupBond.create('dropdown-menu', props()),
				(id, bond) => menuItem({ id }, bond)
			)
		},
		select: {
			canonical: measure(
				() => PopupBond.create('select', props()),
				(id, bond) => selectItem({ id, value: id }, bond)
			)
		}
	};
}
