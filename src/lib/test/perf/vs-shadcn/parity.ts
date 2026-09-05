/** Only this narrow workload is asserted equivalent. Different DOM/behavior stays diagnostic. */
export function workload(name: string): string {
	if (name === 'button') return 'native button text, type, click, class updates and hydration';
	if (name.includes('direct'))
		return 'integration: import styles differ; no competitive parity claim';
	if (name === 'table') return 'integration: selectable CSS grid versus native table';
	if (name === 'popover') return 'integration: positioned portal versus ContentStatic';
	if (name === 'tree') return 'floor: hand-written tree without library behavior';
	return 'integration: semantics differ or behavioral equivalence not established';
}

export function assertButtons(target: HTMLElement, n: number, tint = '', bump = ''): void {
	const buttons = target.querySelectorAll('button');
	if (buttons.length !== n + 1) throw new Error('button fixture cardinality mismatch');
	buttons.forEach((button, i) => {
		if (
			button.type !== 'button' ||
			button.disabled ||
			button.textContent?.trim() !== (i === n ? 'Probe' : `Press ${i}`)
		) {
			throw new Error('button fixture semantics mismatch');
		}
		const klass = i === n ? bump : tint;
		if (klass && !button.classList.contains(klass))
			throw new Error('button fixture did not update');
	});
}
