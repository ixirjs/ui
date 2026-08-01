import { describe, expect, it, vi } from 'vitest';
import { Bond } from '$ixirjs/ui/shared/bond';
import {
	capabilityKey,
	customRole,
	defineCapability,
	normalizeCapabilities,
	roles,
	sharedCapabilityKey,
	type Capability,
	type CapabilityKey
} from './capability';

class State extends Bond {
	constructor() {
		super({});
	}
}

// Capability keys carry Surface in both input and output positions.
const stringKey = capabilityKey<string>('string');
const numberKey = capabilityKey<number>('number');
// @ts-expect-error CapabilityKey surfaces are invariant.
const _invariantKey: CapabilityKey<number> = stringKey;
void numberKey;
// @ts-expect-error Descriptors are factory-branded; a structural literal is not registrable.
const _rawDescriptor: Capability<void> = { slot: capabilityKey<void>('raw') };
void _rawDescriptor;

describe('capability protocol', () => {
	it('converges compatible shared keys and diagnoses incompatible protocol declarations', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const first = sharedCapabilityKey<void>({
			owner: '@ixirjs/test',
			name: 'shared-protocol',
			version: 1
		});
		const second = sharedCapabilityKey<void>({
			owner: '@ixirjs/test',
			name: 'shared-protocol',
			version: 1
		});
		const incompatible = sharedCapabilityKey<void>({
			owner: '@ixirjs/test',
			name: 'shared-protocol',
			version: 2
		});

		expect(first).toBe(second);
		expect(first).toBe(incompatible);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('incompatible shared capability key')
		);
		warn.mockRestore();
	});

	it('rejects raw descriptors at runtime', () => {
		const state = new State();
		const slot = capabilityKey<void>('guarded');
		expect(() => state.capability({ slot } as Capability<void>)).toThrow(/must be created/);
	});

	it('validates composition output and retains the original slot position on replacement', () => {
		const state = new State();
		const first = capabilityKey<string>('first');
		const second = capabilityKey<string>('second');
		state.capability(defineCapability({ slot: first, surface: 'first' }));
		state.capability(defineCapability({ slot: second, surface: 'second' }));
		state.capability(defineCapability({ slot: first, surface: 'replacement' }));
		expect(state.capabilities.map((capability) => capability.slot)).toEqual([first, second]);
		expect(state.requireSurface(first)).toBe('replacement');

		const malformed = defineCapability({
			slot: first,
			compose: () => defineCapability({ slot: second, surface: 'wrong-slot' })
		});
		expect(() => state.capability(malformed)).toThrow(/preserve its registered slot/);
	});

	it('normalizes a capability list with last-wins ordering', () => {
		const slot = capabilityKey<string>('recipe');
		const first = defineCapability({ slot, surface: 'first' });
		const last = defineCapability({ slot, surface: 'last' });
		expect(normalizeCapabilities([first, last])).toEqual([last]);
	});

	it('uses typed built-ins and namespaced custom role identities', () => {
		const custom = customRole<'item', { id: string }>({ owner: '@acme/widgets', name: 'item' });
		expect(roles.item).toBe('item');
		expect(custom).toBe('@acme/widgets:role:item');
		const cell: typeof roles.cell = roles.cell;
		const context: Parameters<
			(typeof roles)['cell'] extends never ? never : (ctx: { headers?: string }) => void
		>[0] = { headers: 'column' };
		void cell;
		void context;
	});
});
