import type { RequestHandler } from './$types';
import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { dev } from '$app/environment';

// MCP Server Implementation for @svelte-atoms/core
// Using @modelcontextprotocol/sdk with HTTP transport

let baseUrl: string | null = null;
const log = {
	error: (message: string, error?: unknown) => {
		console.error(`[MCP Error] ${message}`, error);
	},
	info: (message: string) => {
		if (dev) {
			console.log(`[MCP Info] ${message}`);
		}
	}
};

// Get base URL based on environment
function getBaseUrl(url: string): string {
	return new URL(url).origin;
}

// Helper to read documentation from llms.txt endpoints
async function readDocFromEndpoint(path: string, baseUrl: string): Promise<string> {
	try {
		const url = `${baseUrl}${path}`;
		log.info(`Fetching documentation from: ${url}`);
		const response = await fetch(url);
		if (response.ok) {
			return await response.text();
		}
		log.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
		return '';
	} catch (error) {
		log.error(`Error fetching ${path}`, error);
		return '';
	}
}

// Helper to list component docs
function listComponentDocs(): string[] {
	try {
		const componentsPath = join(process.cwd(), 'src', 'routes', 'docs', 'components');
		if (existsSync(componentsPath)) {
			return readdirSync(componentsPath)
				.filter((file) => {
					const filePath = join(componentsPath, file);
					const stat = statSync(filePath);
					return stat.isDirectory();
				})
				.map((dir) => dir);
		}
		log.error(`Components path not found: ${componentsPath}`);
		return [];
	} catch (error) {
		log.error('Error listing component docs', error);
		return [];
	}
}

// Create MCP Server instance
// const server = new McpServer({
// 	name: SERVER_NAME,
// 	version: SERVER_VERSION,
// 	title: 'Svelte Atoms MCP Server',
// 	websiteUrl: 'https://sacore.netlify.app',
// });

const getOrInitBaseUrl = (url: string): string => {
	if (!baseUrl) {
		baseUrl = getBaseUrl(url);
		log.info(`Base URL initialized: ${baseUrl}`);
	}
	return baseUrl;
};

const handler = createMcpHandler(
	(server) => {
		// Get base URL from request context (will be set by handlers)
		const currentBaseUrl = baseUrl || 'http://localhost:5173'; // Fallback for development

		// Register Tools
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
				// Validate and sanitize input
				const lowercaseName = name?.toLowerCase().trim();
				if (!lowercaseName || !/^[a-z0-9-]+$/.test(lowercaseName)) {
					throw new Error(
						'Invalid component name. Use lowercase letters, numbers, and hyphens only.'
					);
				}

				const content = await readDocFromEndpoint(
					`/docs/components/${lowercaseName}/llms.txt`,
					currentBaseUrl
				);

				if (!content) {
					return {
						content: [
							{
								type: 'text',
								text: `Component "${lowercaseName}" not found. Use list-components to see available components.`
							}
						]
					};
				}

				return {
					content: [
						{
							type: 'text',
							text: content
						}
					]
				};
			}
		);

		server.registerTool(
			'list-components',
			{
				description: 'List all available components in the library with brief descriptions',
				inputSchema: {}
			},
			() => {
				const components = listComponentDocs();
				const componentList = components.map((name) => `- ${name}`).join('\n');

				return {
					content: [
						{
							type: 'text',
							text: `# Available Components\n\nTotal: ${components.length} components\n\n${componentList}\n\nUse get_component_info to get detailed information about any component.`
						}
					]
				};
			}
		);

		server.registerTool(
			'get-quick-start',
			{
				description: 'Get quick start guide for using the library',
				inputSchema: {}
			},
			async () => {
				const overview = await readDocFromEndpoint('/docs/overview/llms.txt', currentBaseUrl);
				const quickRef = await readDocFromEndpoint(
					'/docs/quick-reference/llms.txt',
					currentBaseUrl
				);

				return {
					content: [
						{
							type: 'text',
							text: `# Quick Start Guide\n\n## Overview\n\n${overview}\n\n## Quick Reference\n\n${quickRef}`
						}
					]
				};
			}
		);

		server.registerTool(
			'use-preset',
			{
				description: 'Configurate components global presets',
				inputSchema: {}
			},
			async () => {
				const presetDoc = await readDocFromEndpoint('/docs/preset/llms.txt', currentBaseUrl);

				return {
					content: [
						{
							type: 'text',
							text: presetDoc
						}
					]
				};
			}
		);

		server.registerTool(
			'create-variant',
			{
				description: 'Create components with custom variants',
				inputSchema: {}
			},
			async () => {
				const variantsDoc = await readDocFromEndpoint('/docs/variants/llms.txt', currentBaseUrl);

				return {
					content: [
						{
							type: 'text',
							text: variantsDoc
						}
					]
				};
			}
		);

		// Consolidated component crafting tool (replaces create/improve/fix-component)
		server.registerTool(
			'craft-component',
			{
				description:
					'Get guidance for creating, improving, or fixing components using atoms architecture',
				inputSchema: {
					action: z
						.enum(['create', 'improve', 'fix'])
						.optional()
						.describe('The action to perform (create, improve, or fix)')
				}
			},
			async ({ action }) => {
				const craftingDoc = await readDocFromEndpoint('/docs/crafting/llms.txt', currentBaseUrl);

				if (!craftingDoc) {
					throw new Error('Crafting documentation not found');
				}

				const actionText = action ? ` (${action})` : '';
				return {
					content: [
						{
							type: 'text',
							text: `# Component Crafting Guide${actionText}\n\n${craftingDoc}`
						}
					]
				};
			}
		);

		// Register Resources
		const resourceDocs = [
			{
				name: 'overview',
				title: 'Library Overview',
				description: 'Introduction, features, and quick start guide'
			},
			{
				name: 'imports',
				title: 'Import Guide',
				description: 'How to import components and utilities from @svelte-atoms/core'
			},
			{
				name: 'variants',
				title: 'Variants System',
				description: 'How to use and create component custom variants locally & globally'
			},
			{
				name: 'preset',
				title: 'Preset System',
				description: 'How to use and create components presets'
			},
			{
				name: 'motion',
				title: 'Motion System',
				description: 'Animation and motion utilities for components'
			},
			{
				name: 'philosophy',
				title: 'Library Philosophy',
				description: 'Atoms vs Bonds, rendering system, and extension patterns'
			},
			{
				name: 'quick-reference',
				title: 'Quick Reference',
				description: 'Component lookup table and common patterns'
			},
			{
				name: 'naming-convention',
				title: 'Naming Conventions',
				description: 'File, variable, and component naming standards'
			},
			{
				name: 'atoms',
				title: 'Atoms Concept',
				description: 'Understanding atoms - the fundamental building blocks'
			},
			{
				name: 'bonds',
				title: 'Bonds Concept',
				description: 'Understanding bonds - component communication mechanisms'
			},
			{
				name: 'styling',
				title: 'Styling Guide',
				description: 'How to style components and create custom themes'
			},
			{
				name: 'composition',
				title: 'Component Composition',
				description: 'Patterns for composing complex components'
			},
			{
				name: 'crafting',
				title: 'Crafting Components',
				description: 'Guide to creating custom components from scratch'
			},
			{
				name: 'usage',
				title: 'Usage Guide',
				description: 'How to use components in your application'
			},
			{
				name: 'transitions',
				title: 'Transitions & Animations',
				description: 'Adding transitions and animations to components'
			},
			{
				name: 'accessibility',
				title: 'Accessibility',
				description: 'Accessibility features and best practices'
			},
			{
				name: 'preset-variant-integration',
				title: 'Preset-Variant Integration',
				description: 'How presets and variants work together'
			},
			{
				name: 'quick-start',
				title: 'Quick Start',
				description: 'Getting started quickly with the library'
			}
		];

		resourceDocs.forEach(({ name, title, description }) => {
			server.registerResource(
				`docs-${name}`,
				`docs://${name}`,
				{
					title,
					description,
					mimeType: 'text/plain'
				},
				async () => {
					const content = await readDocFromEndpoint(`/docs/${name}/llms.txt`, currentBaseUrl);
					log.info(`Loading resource doc: ${name}`);

					if (!content) {
						throw new Error(`Resource not found: ${name}`);
					}

					return {
						contents: [
							{
								uri: `docs://${name}`,
								mimeType: 'text/plain',
								text: content
							}
						]
					};
				}
			);
		});

		// Register component resources dynamically
		const components = listComponentDocs();

		components.forEach((component) => {
			server.registerResource(
				`docs-component-${component}`,
				`docs://components/${component}`,
				{
					title: `${component} Component`,
					description: `Documentation for ${component} component`,
					mimeType: 'text/plain'
				},
				async () => {
					log.info(`Loading component resource: ${component}`);
					const content = await readDocFromEndpoint(
						`/docs/components/${component}/llms.txt`,
						currentBaseUrl
					);

					if (!content) {
						throw new Error(`Component resource not found: ${component}`);
					}

					return {
						contents: [
							{
								uri: `docs://components/${component}`,
								mimeType: 'text/plain',
								text: content
							}
						]
					};
				}
			);
		});

		// Register Prompts
		server.registerPrompt(
			'create-component',
			{
				description: 'Generate a new component using @svelte-atoms/core',
				argsSchema: {
					componentType: z
						.string()
						.describe('Type of component to create (e.g., "form", "button", "dialog")'),
					features: z.string().optional().describe('Specific features or requirements')
				}
			},
			({ componentType, features }) => {
				const type = componentType || 'component';
				const feat = features || 'standard functionality';

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: `Create a ${type} component using @svelte-atoms/core library with the following features: ${feat}\n\nCRITICAL IMPORT RULES:\n- ALL imports MUST use named imports from '@svelte-atoms/core'\n- Example: import { Button, Input, Dialog } from '@svelte-atoms/core';\n- NEVER use default imports\n- NEVER use subpath imports like '@svelte-atoms/core/components/button'\n- Component names are PascalCase (Button, Dialog, Dropdown)\n- Utility names are camelCase (clickOutside, portal, focusTrap)\n\nFollow these guidelines:\n1. Use Svelte 5 syntax with runes ($state, $derived, $effect)\n2. Import components using named imports from @svelte-atoms/core\n3. Use proper TypeScript types\n4. Follow kebab-case for file names\n5. Include accessibility features\n6. Add inline code comments\n\nProvide complete, working code with correct imports.`
							}
						}
					]
				};
			}
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
			({ code, issue }) => {
				const codeStr = code || '';
				const issueStr = issue || 'unknown issue';

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: `Fix the following component from @svelte-atoms/core:\n\nIssue: ${issueStr}\n\nCode:\n\`\`\`svelte\n${codeStr}\n\`\`\`\n\nCRITICAL: Ensure all imports use named imports from '@svelte-atoms/core'\nExample: import { Button, Input } from '@svelte-atoms/core';\n\nProvide the corrected code following @svelte-atoms/core best practices.`
							}
						}
					]
				};
			}
		);

		server.registerPrompt(
			'improve-component',
			{
				description: 'Suggest improvements for a component',
				argsSchema: {
					code: z.string().describe('The component code to improve')
				}
			},
			({ code }) => {
				const codeStr = code || '';

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: `Improve the following component using @svelte-atoms/core best practices:\n\n\`\`\`svelte\n${codeStr}\n\`\`\`\n\nSuggestions should include:\n1. Correct imports (named imports from '@svelte-atoms/core')\n2. Better use of library features\n3. Performance optimizations\n4. Accessibility improvements\n5. Code organization\n6. TypeScript type safety`
							}
						}
					]
				};
			}
		);
	},
	{},
	{
		basePath: '/api', // must match where [transport] is located
		maxDuration: 60,
		verboseLogs: true
	}
);

// SvelteKit handlers that bridge HTTP to MCP

export const POST: RequestHandler = async ({ request }) => {
	try {
		getOrInitBaseUrl(request.url);
		return await handler(request);
	} catch (error) {
		log.error('POST handler error', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

// SvelteKit GET handler - returns server info
export const GET: RequestHandler = async ({ request }) => {
	try {
		getOrInitBaseUrl(request.url);
		return await handler(request);
	} catch (error) {
		log.error('GET handler error', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		getOrInitBaseUrl(request.url);
		return await handler(request);
	} catch (error) {
		log.error('DELETE handler error', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
