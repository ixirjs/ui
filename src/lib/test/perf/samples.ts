/** Balanced execution order and raw-sample validation shared by performance harnesses. */
export function roundOrder<T>(items: readonly T[], round: number): T[] {
	const ordered = [...items];
	if (round % 2) ordered.reverse();
	return ordered;
}

export function validateSampling(rounds: number, warmup: number): void {
	if (
		!Number.isSafeInteger(rounds) ||
		!Number.isSafeInteger(warmup) ||
		warmup < 1 ||
		rounds - warmup < 4
	) {
		throw new Error('benchmarks require a positive warmup and at least four measured rounds');
	}
}

export function median(samples: readonly number[]): number {
	if (!samples.length || Array.from(samples).some((value) => !Number.isFinite(value))) {
		throw new Error('missing or non-finite benchmark samples');
	}
	const sorted = [...samples].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle]! : sorted[middle - 1]! / 2 + sorted[middle]! / 2;
}

/** Paired, two-round-block percentile bootstrap. Adjacent rounds run opposite arm orders.
 * Estimates a ratio of means, not a minimum or an average of per-round ratios.
 * Intervals describe this run only: workload parity and machine stability remain separate gates.
 */
export function pairedComparison(ours: readonly number[], theirs: readonly number[]) {
	if (ours.length !== theirs.length) throw new Error('unpaired benchmark samples');
	median(ours);
	median(theirs);
	if (ours.some((n) => n <= 0) || theirs.some((n) => n <= 0)) {
		return { status: 'inconclusive', reason: 'nonpositive marginal cost' } as const;
	}
	// Eight counterbalanced blocks is a minimum, not proof of statistical power.
	if (ours.length < 16 || ours.length % 2) {
		return {
			status: 'inconclusive',
			reason: 'requires an even count of at least 16 paired rounds'
		} as const;
	}
	const blocks = ours.length / 2;
	let seed = 123456789;
	const ratios: number[] = [];
	for (let repetition = 0; repetition < 2000; repetition++) {
		let left = 0;
		let right = 0;
		for (let block = 0; block < blocks; block++) {
			seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
			const i = Math.floor((seed / 4294967296) * blocks) * 2;
			left += ours[i]! + ours[i + 1]!;
			right += theirs[i]! + theirs[i + 1]!;
		}
		if (!Number.isFinite(left) || !Number.isFinite(right))
			throw new Error('benchmark aggregate overflow');
		ratios.push(left / right);
	}
	ratios.sort((a, b) => a - b);
	const interval = [ratios[49]!, ratios[1949]!] as const;
	const ratio =
		ours.reduce((a, b) => a + b / ours.length, 0) /
		theirs.reduce((a, b) => a + b / theirs.length, 0);
	if (!Number.isFinite(ratio)) throw new Error('invalid aggregate ratio');
	return {
		ratio,
		interval,
		status: interval[1] < 1 ? 'lower' : interval[0] > 1 ? 'higher' : 'inconclusive'
	} as const;
}
