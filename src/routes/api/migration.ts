// Migration planning for the MCP server.
//
// Two sources, deliberately split:
//   - archived public surfaces (src/docs/migrations/surfaces/<version>.json) give *exhaustive*
//     mechanical coverage — every export that disappeared between two versions, with no author
//     needing to remember it;
//   - notes.ts gives *intent* — what to use instead, which a diff can never infer.
// The planner merges them so neither has to be complete on its own.

import { migrationNotes, type MigrationNote } from '$docs/migrations/notes';

type Surface = {
	version: string;
	packageExports: string[];
	componentFacades: string[];
	rootExports: string[];
	sharedExports: string[];
	experimentalExports: string[];
	presetExports: string[];
	utilsExports: string[];
};

const surfaceModules = import.meta.glob<Surface>('$docs/migrations/surfaces/*.json', {
	eager: true,
	import: 'default'
});

// ponytail: only versions released from alpha.48 onward have an archived surface, so plans
// from anything older are notes-only (diffedFrom: null). Backfill by deriving surfaces from
// published npm tarballs' dist/*.d.ts if a consumer actually needs a diff across the alphas.

/** Archived versions, oldest first. */
export const archivedVersions = Object.values(surfaceModules)
	.map((surface) => surface.version)
	.sort(compareVersions);

const surfaceByVersion = new Map(
	Object.values(surfaceModules).map((surface) => [surface.version, surface] as const)
);

// The archive is never empty: `prepack` writes the version being published, and the current
// version is checked in. An empty glob means the surfaces directory moved — fail loudly at
// import rather than silently planning every migration as "no changes".
if (!archivedVersions.length) {
	throw new Error('No archived public surfaces found in $docs/migrations/surfaces/*.json');
}

export const latestVersion = archivedVersions[archivedVersions.length - 1]!;
const earliestVersion = archivedVersions[0]!;

// Semver ordering, enough for this package's own tags. Intl.Collator with numeric:true gets
// prerelease ordering backwards (it ranks "1.0.0" below "1.0.0-alpha.48" because the shorter
// string sorts first), which would silently invert every plan spanning the 1.0.0 release.
export function compareVersions(a: string, b: string): number {
	const [coreA, preA] = splitVersion(a);
	const [coreB, preB] = splitVersion(b);

	for (let i = 0; i < 3; i++) {
		const diff = (coreA[i] ?? 0) - (coreB[i] ?? 0);
		if (diff !== 0) return diff < 0 ? -1 : 1;
	}

	// A release outranks any prerelease of the same core version.
	if (!preA.length !== !preB.length) return preA.length ? -1 : 1;

	for (let i = 0; i < Math.max(preA.length, preB.length); i++) {
		const x = preA[i];
		const y = preB[i];
		if (x === undefined) return -1;
		if (y === undefined) return 1;
		if (x === y) continue;

		const numX = /^\d+$/.test(x);
		const numY = /^\d+$/.test(y);
		if (numX && numY) return Number(x) < Number(y) ? -1 : 1;
		// Numeric identifiers always sort below alphanumeric ones (semver §11).
		if (numX !== numY) return numX ? -1 : 1;
		return x < y ? -1 : 1;
	}
	return 0;
}

function splitVersion(version: string): [number[], string[]] {
	const [core, ...rest] = version.replace(/^v/, '').split('-');
	return [
		core!.split('.').map((part) => Number.parseInt(part, 10) || 0),
		rest.join('-').split('.').filter(Boolean)
	];
}

const SURFACE_KEYS = [
	['rootExports', '@ixirjs/ui'],
	['sharedExports', '@ixirjs/ui/shared'],
	['experimentalExports', '@ixirjs/ui/experimental'],
	['presetExports', '@ixirjs/ui/preset'],
	['utilsExports', '@ixirjs/ui/utils'],
	['componentFacades', '@ixirjs/ui/components/*'],
	['packageExports', 'package exports']
] as const satisfies ReadonlyArray<readonly [keyof Surface, string]>;

export type SurfaceChange = {
	entrypoint: string;
	removed: string[];
	added: string[];
	/** Removed name -> added names that plausibly replace it (shared normalized stem). */
	renameHints: Record<string, string[]>;
};

/** Normalized stem for rename hinting: 'PopoverDialogBond' -> 'popoverdialogbond'. */
const stem = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export function diffSurfaces(from: Surface, to: Surface): SurfaceChange[] {
	const changes: SurfaceChange[] = [];

	for (const [key, entrypoint] of SURFACE_KEYS) {
		const before = new Set(from[key] as string[]);
		const after = new Set(to[key] as string[]);
		const removed = [...before].filter((name) => !after.has(name)).sort();
		const added = [...after].filter((name) => !before.has(name)).sort();
		if (!removed.length && !added.length) continue;

		const renameHints: Record<string, string[]> = {};
		for (const gone of removed) {
			const goneStem = stem(gone);
			const candidates = added.filter((name) => {
				const candidateStem = stem(name);
				return candidateStem.includes(goneStem) || goneStem.includes(candidateStem);
			});
			if (candidates.length) renameHints[gone] = candidates;
		}

		changes.push({ entrypoint, removed, added, renameHints });
	}

	return changes;
}

/** Notes that apply when upgrading `from` -> `to`. Undated notes apply to anyone older than
 *  the earliest archived surface, which is as precise as the record allows. */
export function notesFor(from: string, to: string): MigrationNote[] {
	return migrationNotes.filter((note) => {
		const since = note.since ?? earliestVersion;
		return compareVersions(from, since) < 0 && compareVersions(to, since) >= 0;
	});
}

export type MigrationPlan = {
	from: string;
	to: string;
	/** Nearest archived version at or below `from`, if any — what the diff actually used. */
	diffedFrom: string | null;
	notes: MigrationNote[];
	changes: SurfaceChange[];
};

/** Nearest archived version at or below `version` — a consumer on an unreleased or
 *  unarchived version still gets the closest truthful baseline. */
export function nearestArchived(version: string): string | null {
	let best: string | null = null;
	for (const candidate of archivedVersions) {
		if (compareVersions(candidate, version) <= 0) best = candidate;
	}
	return best;
}

export function planMigration(from: string, to: string = latestVersion): MigrationPlan {
	const diffedFrom = nearestArchived(from);
	const fromSurface = diffedFrom ? surfaceByVersion.get(diffedFrom) : undefined;
	const toSurface = surfaceByVersion.get(to) ?? surfaceByVersion.get(latestVersion);

	return {
		from,
		to,
		diffedFrom: fromSurface ? diffedFrom : null,
		notes: notesFor(from, to),
		changes: fromSurface && toSurface ? diffSurfaces(fromSurface, toSurface) : []
	};
}

/** The plan as instructions an agent can execute against a consumer codebase. */
export function renderPlan(plan: MigrationPlan): string {
	const lines: string[] = [
		`# Migrating @ixirjs/ui ${plan.from} -> ${plan.to}`,
		'',
		'Work top to bottom. Each step names what to search for in the consumer codebase.',
		''
	];

	if (!plan.notes.length && !plan.changes.length) {
		lines.push(
			'No breaking changes recorded for this range. Bump the dependency and run the build.'
		);
		return lines.join('\n');
	}

	if (plan.notes.length) {
		lines.push('## Steps', '');
		plan.notes.forEach((note, index) => {
			lines.push(`### ${index + 1}. ${note.title}`, '', note.detail, '');
			if (note.find) lines.push(`- Find: \`${note.find}\` (regex)`);
			if (note.replace) lines.push(`- Replace with: \`${note.replace}\``);
			if (note.doc) lines.push(`- Full context: call get-doc "${note.doc}"`);
			lines.push('');
		});
	}

	if (plan.changes.length) {
		lines.push(
			'## Surface changes',
			'',
			plan.diffedFrom === plan.from
				? `Mechanical diff of the published API.`
				: `Mechanical diff from the nearest archived surface (${plan.diffedFrom}) — verify anything from between ${plan.from} and ${plan.diffedFrom} by hand.`,
			''
		);

		for (const change of plan.changes) {
			lines.push(`### ${change.entrypoint}`, '');
			for (const gone of change.removed) {
				const hints = change.renameHints[gone];
				lines.push(
					hints?.length
						? `- REMOVED \`${gone}\` — likely now \`${hints.join('` or `')}\` (verify)`
						: `- REMOVED \`${gone}\` — no replacement inferred; search-docs for "${gone}"`
				);
			}
			if (change.added.length)
				lines.push(`- Added: ${change.added.map((n) => `\`${n}\``).join(', ')}`);
			lines.push('');
		}
	}

	lines.push(
		'## Finish',
		'',
		'- Re-run the consumer type check; every remaining error should map to a step above.',
		'- Anything unexplained: call search-docs with the symbol name before guessing.'
	);

	return lines.join('\n');
}
