#!/usr/bin/env node
/**
 * Sync props from TypeScript interfaces to documentation props files using ts-morph
 * Usage: node scripts/sync-props.mjs [component-name]
 *
 * Requires: npm install --save-dev ts-morph
 */
import { writeFileSync, existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Project } from 'ts-morph';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const COMPONENTS_DIR = join(ROOT, 'src/lib/components');
const DOCS_PROPS_DIR = join(ROOT, 'src/routes/docs/components');

// Initialize ts-morph project
const project = new Project({
	tsConfigFilePath: join(ROOT, 'tsconfig.json'),
	skipAddingFilesFromTsConfig: true
});

/**
 * Interfaces to skip during extraction
 */
const SKIP_INTERFACES = new Set([
	'ElementProps',
	'HtmlElementProps',
	'SvgElementProps',
	'HtmlAtomProps',
	'SvgAtomProps'
]);

/**
 * Extract all properties from an interface including inherited ones
 */
function extractAllProperties(interfaceDecl, visited = new Set()) {
	const props = [];
	const interfaceName = interfaceDecl.getName();

	// Prevent infinite recursion
	if (visited.has(interfaceName)) {
		return props;
	}
	visited.add(interfaceName);

	// Get direct properties
	for (const prop of interfaceDecl.getProperties()) {
		const propName = prop.getName();
		const propType = prop.getType();
		const isOptional = prop.hasQuestionToken();

		// Get JSDoc
		const jsDocs = prop.getJsDocs();
		let description = '';
		let defaultValue = undefined;

		for (const jsDoc of jsDocs) {
			const comment = jsDoc.getComment();
			if (typeof comment === 'string') {
				description = comment;
			}

			// Look for @default tag
			for (const tag of jsDoc.getTags()) {
				if (tag.getTagName() === 'default') {
					defaultValue = tag.getComment()?.toString() || undefined;
				}
			}
		}

		// Infer default if not specified
		if (!defaultValue) {
			if (isOptional) {
				const typeText = propType.getText();
				if (typeText.includes('boolean')) defaultValue = 'false';
				else if (typeText.includes('string')) defaultValue = "''";
				else if (typeText.includes('number')) defaultValue = '0';
				else defaultValue = 'undefined';
			} else {
				defaultValue = '-';
			}
		}

		// Generate description if not provided
		if (!description) {
			description = propName.replace(/([A-Z])/g, ' $1').trim();
			description = description.charAt(0).toUpperCase() + description.slice(1);
		}

		// Clean up type text
		let typeText = propType.getText();
		typeText = typeText.replace(/import\(".*?"\)\./g, '');
		typeText = typeText.replace(/\s+/g, ' ');

		props.push({
			name: propName,
			type: typeText,
			default: defaultValue,
			description
		});
	}

	// Get properties from extended interfaces
	for (const heritage of interfaceDecl.getHeritageClauses()) {
		for (const typeNode of heritage.getTypeNodes()) {
			const typeName = typeNode.getExpression().getText();

			// Skip base interfaces we don't want to expand
			if (SKIP_INTERFACES.has(typeName)) {
				continue;
			}

			// Skip Extend interfaces
			if (typeName.includes('Extend')) {
				continue;
			}

			// Try to find the interface declaration
			const symbol = typeNode.getType().getSymbol();
			if (symbol) {
				const declarations = symbol.getDeclarations();
				for (const decl of declarations) {
					if (decl.getKindName() === 'InterfaceDeclaration') {
						const inheritedProps = extractAllProperties(decl, visited);
						// Add inherited props if not already present
						const existingNames = new Set(props.map((p) => p.name));
						for (const inheritedProp of inheritedProps) {
							if (!existingNames.has(inheritedProp.name)) {
								props.push(inheritedProp);
							}
						}
					}
				}
			}
		}
	}

	return props;
}

function generateExportName(interfaceName) {
	// AccordionRootProps -> accordionRootProps
	// ButtonProps -> buttonProps
	return interfaceName.charAt(0).toLowerCase() + interfaceName.slice(1);
}

function parseExistingPropsFile(propsPath) {
	if (!existsSync(propsPath)) {
		return {};
	}

	try {
		const content = readFileSync(propsPath, 'utf-8');
		const existingProps = {};

		// Extract all prop arrays by finding export statements
		const arrayRegex = /export const (\w+): PropDefinition\[\] = \[([\s\S]*?)\n\];/g;
		let match;

		while ((match = arrayRegex.exec(content)) !== null) {
			const [, exportName, arrayContent] = match;
			const props = {};

			// Split by objects (looking for },) to get individual props
			const propObjects = arrayContent.split(/\},\s*\{/);

			for (let i = 0; i < propObjects.length; i++) {
				let objStr = propObjects[i].trim();

				// Add back the braces if needed
				if (!objStr.startsWith('{')) objStr = '{' + objStr;
				if (!objStr.endsWith('}')) objStr = objStr + '}';

				// Helper to extract value from either single or double quotes
				const extractValue = (fieldName) => {
					// Try single quotes first
					let match = objStr.match(new RegExp(`${fieldName}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
					if (match) {
						return match[1].replace(/\\'/g, "'");
					}
					// Try double quotes
					match = objStr.match(new RegExp(`${fieldName}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
					if (match) {
						return match[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
					}
					return null;
				};

				const name = extractValue('name');
				const type = extractValue('type');
				const defaultVal = extractValue('default');
				const description = extractValue('description');

				if (name && type && defaultVal !== null && description !== null) {
					props[name] = {
						type,
						default: defaultVal,
						description
					};
				}
			}

			if (Object.keys(props).length > 0) {
				existingProps[exportName] = props;
			}
		}

		return existingProps;
	} catch (err) {
		console.log(`  ⚠️  Could not parse existing props: ${err.message}`);
		return {};
	}
}

function isBetterDescription(newDesc, existingDesc) {
	if (!existingDesc) return true; // No existing, use new
	if (!newDesc) return false; // No new, keep existing

	// Auto-generated descriptions are usually just the capitalized prop name or single word
	const autoGenPattern = /^[A-Z][a-z]*$/;

	// If new looks auto-generated but existing doesn't, keep existing
	if (autoGenPattern.test(newDesc.trim()) && existingDesc.length > newDesc.length) {
		return false;
	}

	// If existing is much longer and more detailed, keep it
	if (existingDesc.length > newDesc.length * 1.5) {
		return false;
	}

	// If existing has more info (articles, punctuation, specific words), keep it
	const detailedWords = ['the ', 'for ', 'to ', 'attribute', 'behavior', 'whether', 'when', 'if '];
	const existingHasDetail = detailedWords.some((word) => existingDesc.toLowerCase().includes(word));
	const newHasDetail = detailedWords.some((word) => newDesc.toLowerCase().includes(word));

	if (existingHasDetail && !newHasDetail) {
		return false;
	}

	// Default: use new
	return true;
}

function mergeWithExisting(newProps, existingProps, exportName) {
	const existing = existingProps[exportName] || {};
	const merged = [];

	for (const prop of newProps) {
		const existingProp = existing[prop.name];

		if (existingProp) {
			// Merge: prefer existing description and default if they're better
			const defaultToUse = (() => {
				const meaninglessDefaults = ['undefined', '-', "''", '""', '0', 'false'];

				// If existing has a meaningful default (not generic), prefer it
				if (existingProp.default && !meaninglessDefaults.includes(existingProp.default)) {
					return existingProp.default;
				}
				// Otherwise use new default
				return prop.default;
			})();

			const descToUse = isBetterDescription(prop.description, existingProp.description)
				? prop.description
				: existingProp.description;

			merged.push({
				name: prop.name,
				type: prop.type, // Always use new type from source
				default: defaultToUse,
				description: descToUse
			});
		} else {
			// New prop, use as-is
			merged.push(prop);
		}
	}

	return merged;
}

function generatePropsFile(propsMap) {
	let content = `export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

`;

	for (const [exportName, props] of Object.entries(propsMap)) {
		content += `export const ${exportName}: PropDefinition[] = [\n`;

		for (const prop of props) {
			content += `\t{\n`;
			content += `\t\tname: '${prop.name}',\n`;
			content += `\t\ttype: '${prop.type.replace(/'/g, "\\'")}',\n`;
			content += `\t\tdefault: '${prop.default.replace(/'/g, "\\'")}',\n`;
			content += `\t\tdescription: '${prop.description.replace(/'/g, "\\'")}'`;
			content += `\n\t},\n`;
		}

		content += `];\n\n`;
	}

	return content;
}

/**
 * Recursively find all types.ts files in a component directory
 */
function findAllTypesFiles(componentDir) {
	const typesFiles = [];

	function searchDir(dir) {
		try {
			const entries = readdirSync(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);

				try {
					const stat = statSync(fullPath);

					if (stat.isDirectory()) {
						// Skip node_modules and hidden directories
						if (!entry.startsWith('.') && entry !== 'node_modules') {
							searchDir(fullPath);
						}
					} else if (stat.isFile() && entry === 'types.ts') {
						typesFiles.push(fullPath);
					}
				} catch (_err) {
					// Skip files/dirs we can't access
					continue;
				}
			}
		} catch (_err) {
			// Skip directories we can't read
		}
	}

	searchDir(componentDir);
	return typesFiles;
}

function syncComponent(componentName) {
	console.log(`\n📋 Processing ${componentName}...`);

	const componentDir = join(COMPONENTS_DIR, componentName);
	const docsPropsPath = join(DOCS_PROPS_DIR, componentName, 'props.ts');

	if (!existsSync(componentDir)) {
		console.log(`  ⚠️  Component directory not found: ${componentDir}`);
		return false;
	}

	// Find all types.ts files in the component directory
	const typesFiles = findAllTypesFiles(componentDir);

	if (typesFiles.length === 0) {
		console.log(`  ⚠️  No types.ts files found in ${componentDir}`);
		return false;
	}

	console.log(`  ✓ Found ${typesFiles.length} types.ts file(s)`);

	try {
		// Parse existing props to preserve manual edits
		const existingProps = parseExistingPropsFile(docsPropsPath);

		const propsMap = {};

		// Add all types files to the project
		for (const typesPath of typesFiles) {
			project.addSourceFileAtPath(typesPath);
		}

		// Process each types.ts file
		for (const typesPath of typesFiles) {
			const sourceFile = project.getSourceFile(typesPath);
			if (!sourceFile) continue;

			// Find all exported Props interfaces
			const interfaces = sourceFile.getInterfaces().filter((iface) => {
				const name = iface.getName();
				return name.endsWith('Props') && !name.includes('Extend') && iface.isExported();
			});

			if (interfaces.length > 0) {
				console.log(`    From ${typesPath}:`);
			}

			for (const interfaceDecl of interfaces) {
				const interfaceName = interfaceDecl.getName();
				const exportName = generateExportName(interfaceName);

				// Extract all properties including inherited ones
				const props = extractAllProperties(interfaceDecl);

				if (props.length > 0) {
					// Merge with existing to preserve manual edits
					const mergedProps = mergeWithExisting(props, existingProps, exportName);
					propsMap[exportName] = mergedProps;
					console.log(`      - ${interfaceName} → ${exportName} (${mergedProps.length} props)`);
				} else {
					// Check if it already exists in props file to preserve it
					const existingProp = existingProps[exportName];
					if (existingProp && Object.keys(existingProp).length > 0) {
						// Preserve existing props
						const existingArray = Object.entries(existingProp).map(([name, prop]) => ({
							name,
							...prop
						}));
						propsMap[exportName] = existingArray;
						console.log(
							`      - ${interfaceName} → ${exportName} (${existingArray.length} props, preserved)`
						);
					} else {
						// Create empty array but still include it
						propsMap[exportName] = [];
						console.log(`      - ${interfaceName} → ${exportName} (0 props, empty interface)`);
					}
				}
			}
		}

		if (Object.keys(propsMap).length === 0) {
			console.log(`  ⚠️  No props extracted`);
			return false;
		}

		const propsFileContent = generatePropsFile(propsMap);
		writeFileSync(docsPropsPath, propsFileContent, 'utf-8');
		console.log(`  ✅ Updated ${docsPropsPath}`);

		return true;
	} catch (error) {
		console.error(`  ❌ Error: ${error.message}`);
		console.error(error.stack);
		return false;
	}
}

// Main execution
const components = [
	'accordion',
	'alert',
	'avatar',
	'badge',
	'breadcrumb',
	'button',
	'card',
	'checkbox',
	'collapsible',
	'combobox',
	'contextmenu',
	'datagrid',
	'dialog',
	'divider',
	'drawer',
	'dropdown',
	'form',
	'input',
	'label',
	'link',
	'list',
	'menu',
	'popover',
	'radio',
	'scrollable',
	'sidebar',
	'stack',
	'tabs',
	'textarea',
	'toast',
	'tooltip',
	'tree'
];

console.log('🔄 Syncing component props from types.ts to props.ts...\n');

const args = process.argv.slice(2);
const targetComponents = args.length === 0 || args[0] === 'all' ? components : args;

let successCount = 0;
let failCount = 0;

for (const component of targetComponents) {
	if (syncComponent(component)) {
		successCount++;
	} else {
		failCount++;
	}
}

console.log(`\n✨ Completed: ${successCount} synced, ${failCount} failed`);
