<script module lang="ts">
	import { Atom, Bond } from '$ixirjs/ui/public/experimental';
	import { defineBond } from '$ixirjs/ui/public/shared';
	import type { BondStateProps } from '$ixirjs/ui/shared/bond';

	type RootProbeProps = BondStateProps & { disabled?: boolean };
	class RootProbeBase extends Bond<RootProbeProps> {}

	export class RootProbeRootAtom extends Atom<Bond> {
		constructor(bond: Bond | undefined) {
			super(bond, 'root', { namespace: 'root-probe' });
		}
	}

	export class RootProbeTriggerAtom extends Atom<Bond> {
		constructor(bond: Bond | undefined) {
			super(bond, 'trigger', { namespace: 'root-probe' });
		}
	}

	export class ExplicitRootAtom extends Atom<Bond> {
		constructor(bond: Bond | undefined) {
			super(bond, 'root', { namespace: 'explicit-probe' });
		}
	}

	export const RootProbeBond = defineBond({
		name: 'root-probe',
		base: RootProbeBase,
		atoms: {
			root: { atom: RootProbeRootAtom, part: 'surface', role: 'control' },
			trigger: RootProbeTriggerAtom
		}
	});
	export type RootProbeBondInstance = InstanceType<typeof RootProbeBond>;

	// Supplies a `presets` map so the root's own layer resolution is observable.
	export const SelfLayerProbeBond = defineBond({
		name: 'self-layer-probe',
		base: RootProbeBase,
		atoms: { root: RootProbeRootAtom }
	});

	// No authoring metadata: exercises the `options.atom` escape hatch and the `new Ctor(props)`
	// fallback for a definition with no static `create`.
	export class RawProbeBond extends Bond {
		static override CONTEXT_KEY = 'test/raw-probe';
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { useRoot } from '$ixirjs/ui/public/shared';

	let { raw = false }: { raw?: boolean } = $props();

	let customPreset = $state(false);
	let flag = $state(false);

	const ID = $props.id();
	const isRaw = untrack(() => raw);

	const root = isRaw
		? useRoot(RawProbeBond, {}, { atom: (bond) => new ExplicitRootAtom(bond) })
		: useRoot(
				RootProbeBond,
				{
					disabled: [
						() => flag,
						(value: boolean | undefined) => {
							flag = value ?? false;
						}
					]
				},
				{
					preset: () => (customPreset ? 'custom.root' : undefined),
					id: () => ID
				}
			);
</script>

<button data-testid="toggle-root-preset" onclick={() => (customPreset = true)}>preset</button>
<button data-testid="toggle-root-flag" onclick={() => (flag = true)}>flag</button>
<div
	data-testid={isRaw ? 'raw-root' : 'declared-root'}
	data-bond-name={root.bond.name}
	data-shared={RootProbeBond.get() === root.bond || RawProbeBond.get() === root.bond}
	data-atom-type={isRaw
		? root.atom instanceof ExplicitRootAtom
		: root.atom instanceof RootProbeRootAtom}
	data-role={root.atom.hasRole('control')}
	data-registration={root.bond.nodeByPart(isRaw ? 'root' : 'surface') === root.atom}
	data-slot={root.slot}
	data-preset={root.preset}
	data-preset-layer={root.presetLayer === undefined}
	data-state-flag={String(root.props.disabled)}
	data-id-seed={root.bond.id === ID}
	data-get-bond={root.getBond() === root.bond}
></div>
