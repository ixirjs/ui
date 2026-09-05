/** Pure growth evaluator. Missing evidence is a failure, including in JSON reports. */
export const TOLERANCE = 0.3;
export const CEILING = 1.5;

export function growth(row) {
	const { name, counts, ms, elements } = row;
	if (
		typeof name !== 'string' ||
		!name ||
		!Array.isArray(counts) ||
		counts.length !== 4 ||
		!Array.isArray(ms) ||
		ms.length !== counts.length ||
		!Array.isArray(elements) ||
		elements.length !== counts.length
	)
		throw new Error('growth row requires a name and four counts, timings and element counts');
	for (let i = 0; i < counts.length; i++) {
		if (!Number.isSafeInteger(counts[i]) || counts[i] <= 0 || (i && counts[i] <= counts[i - 1])) {
			throw new Error(`${name}: counts must be positive increasing integers`);
		}
		if (
			!Number.isFinite(ms[i]) ||
			ms[i] <= 0 ||
			!Number.isSafeInteger(elements[i]) ||
			elements[i] < 0
		) {
			throw new Error(`${name}: invalid timing or element count`);
		}
	}
	if (elements.at(-1) - elements[0] < (counts.at(-1) - counts[0]) * 0.5) {
		throw new Error(`${name}: fixture does not render its requested growth`);
	}
	const x = counts.map(Math.log);
	const y = ms.map(Math.log);
	const meanX = x.reduce((a, b) => a + b, 0) / x.length;
	const meanY = y.reduce((a, b) => a + b, 0) / y.length;
	const fitted =
		x.reduce((sum, value, i) => sum + (value - meanX) * (y[i] - meanY), 0) /
		x.reduce((sum, value) => sum + (value - meanX) ** 2, 0);
	// Historical baselines used endpoints. Keep that comparison rather than silently changing
	// the meaning of recorded budgets; additionally apply the absolute ceiling to the full fit.
	const endpoint = (y.at(-1) - y[0]) / (x.at(-1) - x[0]);
	if (!Number.isFinite(fitted) || !Number.isFinite(endpoint))
		throw new Error(`${name}: invalid exponent`);
	return { fitted, endpoint };
}

export function evaluateGrowth(results, baseline, required) {
	if (!Array.isArray(required) || !required.length || new Set(required).size !== required.length) {
		throw new Error('growth gate requires a nonempty, unique scenario list');
	}
	if (
		!baseline ||
		typeof baseline.recorded !== 'string' ||
		!baseline.exponents ||
		typeof baseline.exponents !== 'object' ||
		Array.isArray(baseline.exponents)
	) {
		throw new Error('missing or invalid growth baseline; record one explicitly with --update');
	}
	for (const [name, value] of Object.entries(baseline.exponents)) {
		if (!Number.isFinite(value)) throw new Error(`${name}: invalid baseline exponent`);
	}
	if (!Array.isArray(results) || results.length !== required.length) {
		throw new Error('missing or extra growth scenarios');
	}
	const seen = new Set();
	const exponents = {};
	const failures = [];
	for (const row of results) {
		if (!required.includes(row.name) || seen.has(row.name))
			throw new Error(`unexpected or duplicate scenario: ${row.name}`);
		seen.add(row.name);
		const measured = growth(row);
		exponents[row.name] = measured;
		const was = baseline.exponents[row.name];
		if (was === undefined) throw new Error(`${row.name}: missing baseline entry`);
		if (Math.max(measured.fitted, measured.endpoint) > CEILING) {
			failures.push(
				`${row.name}: fitted k=${measured.fitted.toFixed(2)}, endpoint k=${measured.endpoint.toFixed(2)} exceeds ceiling ${CEILING}`
			);
		} else if (measured.endpoint > was + TOLERANCE) {
			failures.push(
				`${row.name}: endpoint k=${measured.endpoint.toFixed(2)} exceeds baseline + tolerance ${(was + TOLERANCE).toFixed(2)}`
			);
		}
	}
	return { exponents, failures };
}
