<script lang="ts">
	import { Bond, bindBond } from '$ixirjs/ui/shared/bond';

	let { bond }: { bond: Bond } = $props();

	const binding = bindBond(() => bond, {});
	const sharedBond = binding.bond.share();
	const isShared = Bond.get() === sharedBond;
</script>

<div data-testid="bind-probe" data-shared={isShared}></div>
