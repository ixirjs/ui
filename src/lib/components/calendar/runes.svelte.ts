// A plain Date on purpose: the reactive cell below is the `$state`, and the value it holds is
// replaced wholesale on each tick rather than mutated. Declared here, outside every call argument
// list, so no `eslint-disable` comment lands between a call and its arguments — Rollup drops the
// `/* @__PURE__ */` annotation it then cannot place, and warns on every build.
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const now = (): Date => new Date();

export function today(ms = 1000 * 60) {
	let date = $state(now());

	const date_readonly = $derived(date);

	let timeout_id: NodeJS.Timeout | undefined = undefined;
	let interval_id: NodeJS.Timeout | undefined = undefined;

	$effect(() => {
		timeout_id = setTimeout(
			() => {
				interval_id = setInterval(() => {
					date = now();
				}, ms);
			},
			1000 - (Date.now() % 1000)
		);

		return () => {
			clearTimeout(timeout_id);
			clearInterval(interval_id);
		};
	});

	return {
		get current() {
			return date_readonly;
		}
	};
}
