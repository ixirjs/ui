// Canonical teleport primitive: re-parent `node` into `target`, return a cleanup that removes it.
// A bare synchronous move — masking it (opacity/visibility) is the caller's transition's job.
export function port(node: HTMLElement, target: HTMLElement | undefined = document.body) {
	// No target: inert cleanup, not a throw — the target can flip to undefined mid-life
	// (sink unmounting) and must not throw during the re-run/unmount race.
	if (!target) {
		return () => {};
	}

	if (node.parentElement !== target) {
		target.appendChild(node);
	}

	return () => {
		node.remove();
	};
}
