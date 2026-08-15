<script lang="ts">
	// The same menu compositions, with `defaultPreset` installed.
	//
	// This is the arm that actually pins sentinel PLACEMENT. With no preset installed `presetClass`
	// is empty, so `mergeClassesWithPreset` emits the same string wherever the `$preset` sentinel
	// sits — the position is unobservable and a change to it snapshots identically. Installing a
	// preset makes it observable, which matters here because a menu item's class today carries TWO
	// sentinels (the wrapper's and `List.Item`'s) and only the LAST one places
	// (`atom/resolve/classes.ts` uses `lastIndexOf`).
	//
	// It also pins the preset KEY. `list.item` resolves to `px-4 py-3` where `select.item` resolves
	// to `px-2 py-1.5`, and the `list.item` fallback is currently dead because `mergeAtomProps`
	// always supplies a truthy `preset`. If a change let it fire, every option and menu item in every
	// app would silently restyle — and with no preset installed, nothing would notice.
	//
	// A separate component rather than another arm on the main probe: `setPreset` writes context at
	// init, so it cannot be made conditional inside one component.
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	import Probe, { type Menu } from './menu-ssr-probe.test.svelte';

	let { menu }: { menu: Menu } = $props();

	setPreset(defaultPreset);
</script>

<Probe {menu} />
