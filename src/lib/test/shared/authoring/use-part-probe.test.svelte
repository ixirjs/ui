<script module lang="ts">
	import { Atom, Bond } from '$ixirjs/ui/public/experimental';
	import { defineBond } from '$ixirjs/ui/public/shared';

	export class ProbeRootAtom extends Atom<Bond> {
		constructor(bond: Bond | undefined) {
			super(bond, 'root', { namespace: 'part-probe' });
		}
	}

	export class ProbeTriggerAtom extends Atom<Bond> {
		constructor(bond: Bond | undefined) {
			super(bond, 'trigger', { namespace: 'part-probe' });
		}
	}

	export const ProbeBond = defineBond({
		name: 'part-probe',
		atoms: {
			root: ProbeRootAtom,
			trigger: { atom: ProbeTriggerAtom, part: 'control', role: 'trigger' }
		}
	});
	export type ProbeBondInstance = InstanceType<typeof ProbeBond>;

	// A hyphenated, vowel-initial name: exercises both PascalCase segmentation and article agreement
	// in the derived misuse message.
	export const VowelProbeBond = defineBond({
		name: 'accordion-item',
		atoms: { root: ProbeRootAtom, header: ProbeTriggerAtom }
	});
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { usePart } from '$ixirjs/ui/public/shared';

	let { optional = false }: { optional?: boolean } = $props();
	let customPreset = $state(false);
	const isOptional = untrack(() => optional);
	const owner = isOptional ? undefined : new ProbeBond({}).share();
	const partOptions = { preset: () => (customPreset ? 'custom.part' : undefined) };
	const partProps = () => ({ 'data-user': customPreset ? 'updated' : 'kept' });
	const part = isOptional
		? usePart(ProbeBond, 'trigger', partProps, { ...partOptions, context: 'optional' })
		: usePart(ProbeBond, 'trigger', partProps, partOptions);
</script>

<button data-testid="toggle-part-preset" onclick={() => (customPreset = true)}>preset</button>
<div
	data-testid={isOptional ? 'optional-part' : 'required-part'}
	data-bond-present={Boolean(part.bond)}
	data-atom-type={part.atom instanceof ProbeTriggerAtom}
	data-role={part.atom.hasRole('trigger')}
	data-registration={owner?.nodeByPart('control') === part.atom}
	data-user={part.props['data-user']}
	data-preset={part.props.preset}
></div>
