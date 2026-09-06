// Rehearse an unchanged external consumer against frozen declarations and the real tarball.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	symlinkSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { baselinePath, fingerprint, inspectPackage, unreviewed } from './api-contract.mjs';

const { values } = parseArgs({ options: { minimum: { type: 'boolean', default: false } } });
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'ixir-consumer-'));
const put = (path, content) => {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, content);
};
const run = (command, args) =>
	execFileSync(command, args, { cwd: temp, stdio: 'inherit', timeout: 180_000 });
let server;
let browser;
try {
	const fixtures = JSON.parse(readFileSync(join(root, 'docs/api/consumer-baseline.json'), 'utf8'));
	assert.ok(Object.keys(fixtures).length, 'Missing frozen consumers');
	assert.deepEqual(
		readdirSync(join(root, 'src/lib/test/compatibility'))
			.filter((file) => file.endsWith('.ts') || file.endsWith('.svelte'))
			.sort(),
		Object.keys(fixtures).sort(),
		'Every consumer fixture must be registered; supplement, never replace, the frozen cohort'
	);
	for (const [file, hash] of Object.entries(fixtures)) {
		assert.equal(
			fingerprint(readFileSync(join(root, 'src/lib/test/compatibility', file), 'utf8')),
			hash,
			`Frozen consumer changed: ${file}. Add a cohort; do not rewrite the old consumer.`
		);
	}
	if (values.minimum) {
		const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
		const minimum = manifest.peerDependencies.svelte.replace(/^\^/, '');
		assert.match(
			minimum,
			/^\d+\.\d+\.\d+$/,
			'Revisit the minimum consumer when the peer range changes'
		);
		const dependencies = Object.fromEntries(
			[
				...Object.keys(manifest.dependencies),
				...Object.keys(manifest.peerDependencies),
				'vite',
				'@sveltejs/vite-plugin-svelte',
				'svelte-check',
				'typescript',
				'@types/node'
			].map((name) => [
				name,
				JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8')).version
			])
		);
		dependencies.svelte = minimum;
		put(
			join(temp, 'package.json'),
			JSON.stringify({ private: true, type: 'module', dependencies })
		);
		// Install the compiler, checker and runtime together; swapping only a runtime symlink gives false evidence.
		run('bun', ['install', '--ignore-scripts']);
	} else {
		mkdirSync(join(temp, 'node_modules/@ixirjs'), { recursive: true });
		// Dependencies are the installed lockfile versions; the library itself is NOT a source symlink.
		for (const name of readdirSync(join(root, 'node_modules'))) {
			if (name.startsWith('.') || name === '@ixirjs') continue;
			symlinkSync(join(root, 'node_modules', name), join(temp, 'node_modules', name));
		}
		put(join(temp, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
	}
	const consumerRequire = createRequire(join(temp, 'package.json'));
	const { createServer } = await import(pathToFileURL(consumerRequire.resolve('vite')).href);
	const { svelte } = await import(
		pathToFileURL(consumerRequire.resolve('@sveltejs/vite-plugin-svelte')).href
	);
	const svelteVersion = consumerRequire('svelte/package.json').version;
	console.log(
		`[consumer] Svelte ${svelteVersion}; TypeScript ${consumerRequire('typescript/package.json').version}`
	);
	if (values.minimum) {
		const pluginRequire = createRequire(consumerRequire.resolve('@sveltejs/vite-plugin-svelte'));
		const checkerRequire = createRequire(consumerRequire.resolve('svelte-check/package.json'));
		for (const require of [pluginRequire, checkerRequire])
			assert.equal(
				require('svelte/package.json').version,
				svelteVersion,
				'Compiler/checker must use the selected Svelte version'
			);
	}
	put(
		join(temp, 'tsconfig.json'),
		JSON.stringify({
			compilerOptions: {
				target: 'ES2022',
				module: 'ESNext',
				moduleResolution: 'bundler',
				strict: true,
				exactOptionalPropertyTypes: true,
				noUncheckedIndexedAccess: true,
				skipLibCheck: true,
				allowJs: true,
				checkJs: true,
				types: ['svelte', 'node'],
				lib: ['ES2022', 'DOM', 'DOM.Iterable', 'ESNext.Disposable']
			},
			include: ['**/*.ts', '**/*.svelte']
		})
	);
	for (const file of Object.keys(fixtures))
		cpSync(join(root, 'src/lib/test/compatibility', file), join(temp, file));
	const components = Object.keys(fixtures)
		.filter((file) => file.endsWith('.svelte'))
		.sort();
	assert.ok(components.length, 'Missing runtime consumer fixtures');
	const suite = (files) =>
		put(
			join(temp, 'suite.test.svelte'),
			`<script>${files.map((file, i) => `import C${i} from './${file}';`).join('\n')}</script>\n${files.map((_, i) => `<C${i} />`).join('\n')}`
		);
	suite(components);
	const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
	const library = join(temp, 'node_modules/@ixirjs/ui');
	put(
		join(library, 'package.json'),
		JSON.stringify({ name: '@ixirjs/ui', type: 'module', exports: baseline.exports })
	);
	for (const [file, declaration] of Object.entries(baseline.declarations))
		put(join(library, file), declaration);
	const check = () =>
		run(process.execPath, [
			join(temp, 'node_modules/svelte-check/bin/svelte-check'),
			'--workspace',
			temp,
			'--tsconfig',
			'./tsconfig.json',
			'--fail-on-warnings'
		]);
	console.log('[consumer] frozen worktree declarations');
	check();
	rmSync(library, { recursive: true });
	execFileSync(
		'bun',
		['pm', 'pack', '--ignore-scripts', '--quiet', '--filename', join(temp, 'ui.tgz')],
		{ cwd: root, stdio: 'inherit' }
	);
	mkdirSync(library, { recursive: true });
	run('tar', ['-xzf', join(temp, 'ui.tgz'), '-C', library, '--strip-components=1']);
	const reviews = JSON.parse(readFileSync(join(root, 'docs/api/reviews.json'), 'utf8'));
	assert.deepEqual(
		unreviewed(baseline, inspectPackage(library), reviews),
		[],
		'Packed surface differs from the reviewed contract (including files omitted by packaging)'
	);
	// Current product documentation may use additive APIs; only frozen consumers run against old types.
	cpSync(join(root, 'src/routes/docs/migration/examples'), join(temp, 'examples'), {
		recursive: true
	});
	suite([...components, 'examples/tiles-example.svelte']);
	console.log('[consumer] candidate packed declarations and current documentation');
	check();
	put(
		join(temp, 'server.ts'),
		"import { render } from 'svelte/server'; import App from './suite.test.svelte'; export const output = () => render(App, { idPrefix: 'compat' });"
	);
	put(
		join(temp, 'client.ts'),
		"import { hydrate, unmount } from 'svelte'; import App from './suite.test.svelte'; const app = hydrate(App, { target: document.getElementById('app')!, recover: false }); Object.assign(window, { ready: true, dispose: () => unmount(app) });"
	);
	const serve = async (req, res, next) => {
		if (req.url !== '/') return next();
		try {
			const { output } = await server.ssrLoadModule('/server.ts');
			const { body, head } = output();
			assert.match(body, /Stable title/);
			assert.match(body, /data-theme="consumer"/);
			res.setHeader('Content-Type', 'text/html');
			res.end(
				await server.transformIndexHtml(
					'/',
					`<!doctype html><html><head>${head}</head><body><div id="app">${body}</div><script type="module" src="/client.ts"></script></body></html>`
				)
			);
		} catch (error) {
			next(error);
		}
	};
	server = await createServer({
		root: temp,
		configFile: false,
		plugins: [
			svelte({ configFile: false }),
			{
				name: 'consumer-ssr',
				configureServer(server) {
					server.middlewares.use(serve);
				}
			}
		],
		resolve: { dedupe: ['svelte'] },
		// There is no index.html to scan. Discover dependencies before interactions, not by reloading mid-test.
		optimizeDeps: { entries: [join(temp, 'client.ts')] },
		ssr: { noExternal: ['@ixirjs/ui'] },
		server: { host: '127.0.0.1', port: 0, fs: { allow: [temp, root] } }
	});

	await server.listen();
	browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();
	const errors = [];
	page.on('pageerror', (error) => {
		errors.push(error.message);
		console.error(error.message);
	});
	page.on('console', (message) => {
		if (['warning', 'error'].includes(message.type())) {
			errors.push(message.text());
			console.error(message.text());
		}
	});
	page.on('response', (response) => {
		if (response.status() >= 400) console.error(response.status(), response.url());
	});
	const response = await page.goto(server.resolvedUrls.local[0]);
	assert.equal(response?.status(), 200, 'Consumer SSR must succeed before hydration');
	try {
		await page.waitForFunction(() => window.ready === true);
	} catch (error) {
		console.error(await page.content());
		throw error;
	}
	assert.equal(await page.getByTestId('authored').getAttribute('aria-expanded'), 'false');
	await page.getByTestId('authored').click();
	assert.equal(await page.getByTestId('authored').getAttribute('aria-expanded'), 'true');
	assert.equal(await page.getByTestId('value').textContent(), 'none:0');
	assert.equal(await page.getByTestId('identity').textContent(), 'true');
	assert.equal(await page.getByTestId('selection').textContent(), 'alpha');
	assert.equal(await page.getByTestId('substitute-identity').textContent(), 'true');
	assert.equal(await page.getByTestId('substitute-state').textContent(), 'false');
	await page.getByTestId('disable-substitute').click();
	assert.equal(await page.getByTestId('substitute-state').textContent(), 'true');
	assert.equal(await page.getByTestId('substitute').getAttribute('aria-disabled'), 'true');
	assert.equal(await page.locator('[data-demo="tiles-status"]').textContent(), 'none:none:0');
	await page.locator('[data-demo="tiles-select"]').click();
	assert.equal(await page.locator('[data-demo="tiles-status"]').textContent(), 'alpha:alpha:1');
	await page.locator('[data-demo="tiles-select"]').click();
	assert.equal(await page.locator('[data-demo="tiles-status"]').textContent(), 'alpha:alpha:1');
	await page.getByTestId('choose').click();
	assert.equal(await page.getByTestId('value').textContent(), 'alpha:1');
	await page.getByTestId('choose').click();
	assert.equal(await page.getByTestId('value').textContent(), 'alpha:1');
	await page.getByTestId('inspect-input-state').click();
	assert.deepEqual(JSON.parse(await page.getByTestId('input-state-contract').textContent()), {
		missing: true,
		missingMessage: 'compat missing input',
		key: '@ixirjs/context/bond/input',
		name: 'input',
		sameProps: true,
		ids: [
			'compat-input',
			'input-root-compat-input',
			'input-control-compat-input',
			'input-placeholder-compat-input'
		],
		numeric: ['0', 0, true],
		empty: true,
		fileState: [true, false],
		checkbox: [true, false],
		type: 'time',
		dateIsCopy: true,
		year: 2024
	});
	// Input command callbacks intentionally differ from equality-gated disclosure commands.
	await page.getByTestId('number-increment').click();
	assert.equal(await page.getByTestId('number-contract').textContent(), '1:1:1:1:increment:false');
	await page.getByTestId('number-step').click();
	await page.getByTestId('number-increment').click();
	assert.equal(await page.getByTestId('number-contract').textContent(), '2:2:2:2:increment:false');
	await page.getByTestId('number-increment').click();
	assert.equal(await page.getByTestId('number-contract').textContent(), '2:2:2:2:increment:false');
	await page.getByTestId('number-decrement').click();
	assert.equal(await page.getByTestId('number-contract').textContent(), '1:3:3:1:decrement:false');
	await page.getByTestId('password-toggle').click();
	assert.equal(
		await page.getByTestId('password-contract').textContent(),
		'true:true:secret:toggle:false'
	);
	await page.getByTestId('disable-inputs').click();
	await page.getByTestId('number-increment').click();
	await page.getByTestId('password-toggle').click();
	assert.equal(await page.getByTestId('number-contract').textContent(), '1:3:3:1:decrement:false');
	assert.equal(
		await page.getByTestId('password-contract').textContent(),
		'true:true:secret:toggle:false'
	);
	await page.getByRole('spinbutton', { name: 'AM/PM' }).click();
	assert.equal(await page.getByTestId('time-contract').textContent(), '23:59');
	await page.getByRole('spinbutton', { name: 'AM/PM' }).press('a');
	assert.equal(await page.getByTestId('time-contract').textContent(), '11:59');
	const labelled = await page.getByTestId('card').getAttribute('aria-labelledby');
	assert.ok(labelled);
	assert.equal(await page.locator(`[id="${labelled}"]`).textContent(), 'Stable title');
	await page.evaluate(() => window.dispose());
	assert.equal(await page.getByTestId('card').count(), 0);
	assert.equal(await page.getByTestId('substitute').count(), 0);
	assert.deepEqual(errors, [], 'Unexpected browser diagnostics');
	console.log(
		'[consumer] package resolution, augmentation, bindings, callbacks, identity, SSR, strict hydration and teardown passed'
	);
} finally {
	await browser?.close();
	await server?.close();
	rmSync(temp, { recursive: true, force: true });
}
