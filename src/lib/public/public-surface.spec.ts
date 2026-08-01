import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as root from '$ixirjs/ui/index';
import * as preset from '$ixirjs/ui/preset';
import * as experimental from './experimental';
import * as shared from './shared';
import * as utils from './utils';

const rootExports = [
	'Accordion',
	'AccordionItem',
	'Alert',
	'Avatar',
	'Badge',
	'Breadcrumb',
	'Button',
	'Calendar',
	'Card',
	'Checkbox',
	'Chip',
	'ChipCloseButton',
	'Collapsible',
	'Combobox',
	'Container',
	'ContextMenu',
	'DataGrid',
	'DatePicker',
	'Dialog',
	'Divider',
	'Drawer',
	'DropdownMenu',
	'Field',
	'Form',
	'HtmlAtom',
	'Icon',
	'Image',
	'Input',
	'Kbd',
	'Label',
	'Lazy',
	'Link',
	'List',
	'OtpInput',
	'Popover',
	'PopoverDialog',
	'Portal',
	'PortalSurface',
	'ProgressCircular',
	'ProgressLinear',
	'QRCode',
	'Radio',
	'RadioGroup',
	'Root',
	'Scrollable',
	'setPreset',
	'Select',
	'Shortcut',
	'Sidebar',
	'Slider',
	'Stack',
	'Step',
	'Stepper',
	'Swatch',
	'Switch',
	'Tab',
	'Tabs',
	'Teleport',
	'Textarea',
	'Toast',
	'Toaster',
	'Tooltip',
	'Tree',
	'ZLayer'
] as const;

const sharedExports = [
	'DISCLOSURE',
	'DURATION',
	'INPUT',
	'ROVING',
	'SELECTION',
	'animate',
	'ariaRole',
	'bindBond',
	'capabilityKey',
	'collectionCapability',
	'collectionSlot',
	'controlledProp',
	'createAtomInstance',
	'createDisclosure',
	'createInput',
	'createRovingFocus',
	'createSelection',
	'customRole',
	'dataState',
	'defineAtomCapability',
	'defineBond',
	'defineBondCapability',
	'disclosureCapability',
	'disclosureClose',
	'disclosureToggle',
	'disclosureTrigger',
	'elementRef',
	'errorMessageLink',
	'focusable',
	'fuse',
	'inputCapability',
	'internCapabilityFactory',
	'labelledControl',
	'motion',
	'pressable',
	'roles',
	'rovingCapability',
	'selectionCapability',
	'sharedCapabilityKey',
	'tabPanelLink',
	'triggerContentLink',
	'usePart',
	'useRoot'
] as const;

const experimentalExports = [
	'AccordionBond',
	'AlertBond',
	'Atom',
	'Bond',
	'BondBinding',
	'CAPABILITY_PROTOCOL_VERSION',
	'CalendarBond',
	'CardBond',
	'CollapsibleBond',
	'Collection',
	'ComboboxBond',
	'ContextMenuBond',
	'DataGridBond',
	'DatePickerBond',
	'DialogBond',
	'DrawerBond',
	'DropdownMenuBond',
	'FieldBond',
	'FormBond',
	'InputBond',
	'PopoverBond',
	'PopoverContentAtom',
	'PopoverDialogBond',
	'PopoverIndicatorAtom',
	'PopoverOverlayAtom',
	'PopoverTailAtom',
	'PopoverTriggerAtom',
	'PopoverVirtualTriggerAtom',
	'PortalBond',
	'RadioGroupBond',
	'RootBond',
	'ScrollableBond',
	'SelectBond',
	'SidebarBond',
	'StackBond',
	'StepBond',
	'StepperBond',
	'TabBond',
	'TabsBond',
	'ToastBond',
	'TooltipBond',
	'TreeBond',
	'bondContextKey',
	'defineAtom'
] as const;

const presetExports = [
	'BUILT_IN_PRESET_KEYS',
	'defaultPreset',
	'definePreset',
	'fallbackPreset',
	'mergePresetLayers',
	'setPreset'
] as const;

const surfaceSnapshot = JSON.parse(readFileSync('docs/public-surface.snapshot.json', 'utf8')) as {
	packageExports: string[];
	componentFacades: string[];
	rootExports: string[];
	sharedExports: string[];
	experimentalExports: string[];
	presetExports: string[];
	utilsExports: string[];
};

const componentFacades = import.meta.glob('./components/**/*.ts', { eager: true }) as Record<
	string,
	Record<string, unknown>
>;

describe('published source surfaces', () => {
	it('keeps the root application surface curated', () => {
		expect(Object.keys(root).sort()).toEqual([...rootExports].sort());
		expect(root).not.toHaveProperty('PopoverBond');
		expect(root).not.toHaveProperty('PopoverOverlayAtom');
		expect(root).not.toHaveProperty('Bond');
	});

	it('keeps stable authoring factory-based and curated', () => {
		expect(Object.keys(shared).sort()).toEqual([...sharedExports].sort());
		expect(shared).not.toHaveProperty('CapabilityRegistry');
		expect(shared).not.toHaveProperty('decorateCapability');
		expect(shared).not.toHaveProperty('useCapabilities');
	});

	it('isolates concrete runtime and protocol exports in experimental', () => {
		expect(Object.keys(experimental).sort()).toEqual([...experimentalExports].sort());
		for (const name of experimentalExports) {
			expect(shared).not.toHaveProperty(name);
			expect(experimental).toHaveProperty(name);
		}
	});

	it('keeps component facades application-facing', () => {
		for (const facade of Object.values(componentFacades)) {
			expect(Object.keys(facade).filter((name) => name.endsWith('Bond'))).toEqual([]);
		}
		expect(componentFacades['./components/select.ts']).toHaveProperty('Select');
		expect(componentFacades['./components/select.ts']).toHaveProperty('filterSelectData');
		expect(componentFacades['./components/form/field.ts']).toHaveProperty('Field');
	});

	it('keeps preset and utility operations narrow', () => {
		expect(Object.keys(preset).sort()).toEqual([...presetExports].sort());
		expect(Object.keys(utils).sort()).toEqual(['cn', 'defineVariants', 'isBrowser']);
	});

	it('matches the checked-in public surface snapshot', () => {
		expect([...rootExports].sort()).toEqual([...surfaceSnapshot.rootExports].sort());
		expect([...sharedExports].sort()).toEqual([...surfaceSnapshot.sharedExports].sort());
		expect([...experimentalExports].sort()).toEqual(
			[...surfaceSnapshot.experimentalExports].sort()
		);
		expect([...presetExports].sort()).toEqual([...surfaceSnapshot.presetExports].sort());
		expect(['cn', 'defineVariants', 'isBrowser']).toEqual([...surfaceSnapshot.utilsExports].sort());
	});
});

describe('package export manifest', () => {
	const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
		exports: Record<string, unknown>;
	};

	it('reserves wildcard publication for curated component facades', () => {
		for (const [subpath, target] of Object.entries(pkg.exports)) {
			expect(target).not.toBeNull();
			if (subpath === './components/*') {
				expect(JSON.stringify(target)).toContain('*');
			} else {
				expect(subpath).not.toContain('*');
				expect(JSON.stringify(target)).not.toContain('*');
			}
		}
	});

	it('matches the package and facade declaration snapshot', () => {
		expect(Object.keys(pkg.exports).sort()).toEqual([...surfaceSnapshot.packageExports].sort());
		expect(
			Object.keys(componentFacades)
				.map((name) => name.slice('./components/'.length))
				.sort()
		).toEqual([...surfaceSnapshot.componentFacades].sort());
	});

	it.each([
		'./types',
		'./menu',
		'./dropdown',
		'./virtual',
		'./internal',
		'./button',
		'./form/field'
	])('does not publish %s', (subpath) => expect(pkg.exports).not.toHaveProperty(subpath));
});
