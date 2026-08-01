export function stopMotion(cleanup: unknown, node: Element): void {
	if (typeof cleanup === 'function') {
		cleanup(node);
		return;
	}

	if (!cleanup || typeof cleanup !== 'object' || !('stop' in cleanup)) return;
	const stop = cleanup.stop;
	if (typeof stop === 'function') stop.call(cleanup);
}
