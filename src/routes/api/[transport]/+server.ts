import type { RequestHandler } from './$types';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { componentSlugs, docSlugs, guideSlugs, readDoc } from '../docs';
import {
	archivedVersions,
	compareVersions,
	latestVersion,
	planMigration,
	renderPlan
} from '../migration';

// MCP server for @ixirjs/ui. Serves the docs site's own llms.txt content (see ../docs.ts)
// plus the authoring guidance that lives nowhere else — the prompts and craft-component.

function text(body: string) {
	return { content: [{ type: 'text' as const, text: body }] };
}

const handler = createMcpHandler(
	(server) => {
		server.registerTool(
			'list-docs',
			{
				description:
					'List every documentation page and component available from this server, by slug. Pass a slug to get-doc or get-component-info.',
				inputSchema: {}
			},
			() =>
				text(
					`# @ixirjs/ui docs\n\n## Guides (${guideSlugs.length})\n\n` +
						guideSlugs.map((slug) => `- ${slug}`).join('\n') +
						`\n\n## Components (${componentSlugs.length})\n\n` +
						componentSlugs.map((name) => `- ${name}`).join('\n') +
						`\n\nUse get-doc <slug> for a guide, get-component-info <name> for a component.`
				)
		);

		server.registerTool(
			'get-doc',
			{
				description: `Read a documentation page by slug. Available: ${guideSlugs.join(', ')}`,
				inputSchema: {
					slug: z.string().min(1).describe('Doc slug, e.g. "preset", "variants", "crafting"')
				}
			},
			async ({ slug }) => {
				const content = await readDoc(slug.toLowerCase().trim());
				return content
					? text(content)
					: text(`Doc "${slug}" not found. Use list-docs to see available slugs.`);
			}
		);

		server.registerTool(
			'get-component-info',
			{
				description:
					'Get detailed information about a specific component including API, usage, and examples',
				inputSchema: {
					name: z.string().min(1, 'Component name cannot be empty')
				}
			},
			async ({ name }) => {
				const lowercaseName = name?.toLowerCase().trim();
				if (!lowercaseName || !/^[a-z0-9-]+$/.test(lowercaseName)) {
					throw new Error(
						'Invalid component name. Use lowercase letters, numbers, and hyphens only.'
					);
				}

				const content = await readDoc(`components/${lowercaseName}`);
				return content
					? text(content)
					: text(`Component "${lowercaseName}" not found. Available: ${componentSlugs.join(', ')}`);
			}
		);

		server.registerTool(
			'search-docs',
			{
				description:
					'Full-text search across every doc and component page. Returns matching lines with their source slug — use get-doc or get-component-info to read the full page.',
				inputSchema: {
					query: z.string().min(2).describe('Case-insensitive text to search for'),
					limit: z.number().int().min(1).max(100).optional().describe('Max matches (default 30)')
				}
			},
			async ({ query, limit }) => {
				const needle = query.toLowerCase();
				const max = limit ?? 30;
				const hits: string[] = [];

				for (const slug of docSlugs) {
					if (hits.length >= max) break;
					const content = await readDoc(slug);
					if (!content) continue;

					const lines = content.split('\n');
					for (let i = 0; i < lines.length && hits.length < max; i++) {
						if (lines[i]!.toLowerCase().includes(needle)) {
							hits.push(`${slug}:${i + 1}: ${lines[i]!.trim()}`);
						}
					}
				}

				return text(
					hits.length
						? `# ${hits.length} match${hits.length === 1 ? '' : 'es'} for "${query}"\n\n${hits.join('\n')}`
						: `No matches for "${query}". Use list-docs to see what is available.`
				);
			}
		);

		server.registerTool(
			'craft-component',
			{
				description:
					'Get guidance for creating, improving, or fixing components using the atom/bond architecture',
				inputSchema: {
					action: z
						.enum(['create', 'improve', 'fix'])
						.optional()
						.describe('The action to perform (create, improve, or fix)')
				}
			},
			async ({ action }) => {
				const craftingDoc = await readDoc('crafting');
				if (!craftingDoc) throw new Error('Crafting documentation not found');

				return text(`# Component Crafting Guide${action ? ` (${action})` : ''}\n\n${craftingDoc}`);
			}
		);

		server.registerTool(
			'plan-migration',
			{
				description:
					"Build an ordered, executable migration plan for a consumer codebase upgrading @ixirjs/ui. Give it the version currently in the consumer's package.json. Combines hand-written migration steps with a mechanical diff of the published API surface, and names a regex to search for at each step.",
				inputSchema: {
					from: z.string().min(1).describe('Version the consumer is on now, e.g. "1.0.0-alpha.44"'),
					to: z
						.string()
						.optional()
						.describe(`Target version. Defaults to the newest archived (${latestVersion}).`)
				}
			},
			({ from, to }) => {
				const target = to?.trim() || latestVersion;
				if (compareVersions(from, target) >= 0) {
					return text(
						`Nothing to do: ${from} is not older than ${target}. Archived versions: ${archivedVersions.join(', ')}.`
					);
				}
				return text(renderPlan(planMigration(from.trim(), target)));
			}
		);

		server.registerTool(
			'list-versions',
			{
				description:
					'List the @ixirjs/ui versions with an archived public API surface — the versions plan-migration can diff against.',
				inputSchema: {}
			},
			() =>
				text(
					`# Archived surfaces\n\n${archivedVersions.map((v) => `- ${v}`).join('\n')}\n\n` +
						`Latest: ${latestVersion}. plan-migration accepts any version; it diffs from the nearest archived one at or below it.`
				)
		);

		// Every doc is also a resource, so clients that browse resources see the full set
		// without spending a tool call.
		for (const slug of docSlugs) {
			const uri = `docs://${slug}`;
			server.registerResource(
				`docs-${slug.replace(/\//g, '-')}`,
				uri,
				{
					title: slug.startsWith('components/')
						? `${slug.slice('components/'.length)} component`
						: slug,
					description: `@ixirjs/ui documentation: ${slug}`,
					mimeType: 'text/markdown'
				},
				async () => {
					const content = await readDoc(slug);
					if (!content) throw new Error(`Resource not found: ${slug}`);
					return { contents: [{ uri, mimeType: 'text/markdown', text: content }] };
				}
			);
		}

		// Prompts carry the authoring rules that are not in the docs.
		const IMPORT_RULES = `IMPORT RULES:
- Components come from the package root as named imports: import { Button, Dialog } from '@ixirjs/ui';
- Per-family subpaths are also supported: import { Button } from '@ixirjs/ui/components/button';
- NEVER use default imports.
- Component names are PascalCase (Button, Dialog); utilities are camelCase (clickOutside, portal).`;

		server.registerPrompt(
			'migrate',
			{
				description: 'Upgrade a codebase to a newer @ixirjs/ui version',
				argsSchema: {
					from: z
						.string()
						.optional()
						.describe("Version in the consumer's package.json; read it if not given"),
					to: z.string().optional().describe(`Target version (default ${latestVersion})`)
				}
			},
			({ from, to }) => ({
				messages: [
					{
						role: 'user' as const,
						content: {
							type: 'text' as const,
							text: `Upgrade this codebase from @ixirjs/ui ${from || '<read the version from package.json / the lockfile first>'} to ${to || latestVersion}.

Procedure:
1. Call plan-migration with the exact installed version. Do not guess it — read it from the lockfile, which records what is actually installed.
2. Work the plan's steps in order. For each step, run its "Find" regex across the codebase FIRST and read every hit before editing — the regexes are deliberately broad, and some hits will be unrelated code that must be left alone.
3. Treat "REMOVED ... no replacement inferred" as a research task, not a deletion: call search-docs with the symbol before deciding what replaces it.
4. Rename hints are hints. Confirm each against get-doc or get-component-info before applying it.
5. Bump the dependency, then run the consumer's type check. Every remaining error should map to a step in the plan; if one does not, say so rather than inventing a fix.

Report what you changed per step, and list anything you could not resolve.`
						}
					}
				]
			})
		);

		server.registerPrompt(
			'create-component',
			{
				description: 'Generate a new component using @ixirjs/ui',
				argsSchema: {
					componentType: z
						.string()
						.describe('Type of component to create (e.g. "form", "button", "dialog")'),
					features: z.string().optional().describe('Specific features or requirements')
				}
			},
			({ componentType, features }) => ({
				messages: [
					{
						role: 'user' as const,
						content: {
							type: 'text' as const,
							text: `Create a ${componentType || 'component'} using the @ixirjs/ui library with the following features: ${features || 'standard functionality'}

${IMPORT_RULES}

Follow these guidelines:
1. Svelte 5 runes ($state, $derived, $effect) — no legacy stores or reactive statements.
2. Proper TypeScript types; kebab-case file names.
3. Compose behavior with the bond's capabilities rather than per-root $effects.
4. Include accessibility features (roles, ARIA relationships, keyboard support).
5. Add inline comments for non-obvious decisions only.

Call get-doc "crafting" and get-doc "composition" first if you have not already.
Provide complete, working code.`
						}
					}
				]
			})
		);

		server.registerPrompt(
			'fix-component',
			{
				description: 'Help fix issues with an existing component',
				argsSchema: {
					code: z.string().describe('The component code with issues'),
					issue: z.string().describe('Description of the issue')
				}
			},
			({ code, issue }) => ({
				messages: [
					{
						role: 'user' as const,
						content: {
							type: 'text' as const,
							text: `Fix the following component built on @ixirjs/ui.

Issue: ${issue || 'unknown issue'}

\`\`\`svelte
${code || ''}
\`\`\`

${IMPORT_RULES}

Diagnose the root cause before editing — use search-docs to check the documented behavior of any
@ixirjs/ui API involved. Provide the corrected code.`
						}
					}
				]
			})
		);

		server.registerPrompt(
			'improve-component',
			{
				description: 'Suggest improvements for a component',
				argsSchema: {
					code: z.string().describe('The component code to improve')
				}
			},
			({ code }) => ({
				messages: [
					{
						role: 'user' as const,
						content: {
							type: 'text' as const,
							text: `Improve the following component using @ixirjs/ui best practices:

\`\`\`svelte
${code || ''}
\`\`\`

Cover:
1. Correct imports (see get-doc "imports").
2. Better use of library features — presets and variants over hand-written classes.
3. Accessibility.
4. TypeScript type safety.
5. Anything the library already does that this code re-implements.`
						}
					}
				]
			})
		);
	},
	{},
	{
		basePath: '/api', // must match where [transport] is located
		maxDuration: 60,
		verboseLogs: true
	}
);

const respond: RequestHandler = async ({ request }) => {
	try {
		return await handler(request);
	} catch (error) {
		console.error(`[MCP Error] ${request.method} handler error`, error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

export const GET = respond;
export const POST = respond;
export const DELETE = respond;
