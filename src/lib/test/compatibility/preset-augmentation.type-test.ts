import type { ButtonProps } from '@ixirjs/ui/components/button';
import type { PresetEntry } from '@ixirjs/ui/preset';

declare module '@ixirjs/ui/preset' {
	interface PresetModuleMap {
		'audit.custom': PresetEntry;
	}
}

const buttonWithApplicationPreset = {
	preset: 'audit.custom'
} satisfies ButtonProps;

void buttonWithApplicationPreset;
