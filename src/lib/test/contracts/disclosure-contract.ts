import { describe, expect, it } from 'vitest';

export type DisclosureContractDriver = {
	isOpen: () => boolean;
	parentSet: (value: boolean) => Promise<void>;
	open: () => void;
	close: () => void;
	destroy: () => void;
};

export type DisclosureContractMount = (
	recordChange: (value: boolean, committedValue: boolean | undefined) => void
) => DisclosureContractDriver;

/**
 * Canonical observable contract for controlled disclosure state.
 * Component-specific setup remains in the adapter; sequencing and expectations live here once.
 */
export function defineDisclosureContract(name: string, mount: DisclosureContractMount) {
	describe(`${name} disclosure contract`, () => {
		it('preserves parent echoes, committed callback order, and duplicate suppression', async () => {
			const trace: string[] = [];
			const driver = mount((value, committedValue) => {
				trace.push(`callback:${value}:committed=${committedValue}`);
			});

			try {
				trace.push(`initial:${driver.isOpen()}`);
				await driver.parentSet(true);
				trace.push(`parent:${driver.isOpen()}`);
				driver.close();
				trace.push(`local:${driver.isOpen()}`);
				driver.close();
				driver.open();
				trace.push(`local:${driver.isOpen()}`);

				expect(trace).toEqual([
					'initial:false',
					'parent:true',
					'callback:false:committed=false',
					'local:false',
					'callback:true:committed=true',
					'local:true'
				]);
			} finally {
				driver.destroy();
			}
		});
	});
}
