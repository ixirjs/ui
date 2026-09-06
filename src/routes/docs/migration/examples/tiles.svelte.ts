import { Kernel } from '@ixirjs/ui/shared';
import type { StateChangeCallback } from '@ixirjs/ui';

export interface TilesProps {
	id?: string;
	value?: string;
}

export const TilesContext = Kernel.context<TilesBond>('bond/tiles');

export class TilesBond {
	readonly props: TilesProps;
	#commit: StateChangeCallback<string, TilesBond> | undefined;

	constructor(props: TilesProps) {
		this.props = props;
	}
	static create(props: TilesProps) {
		return new TilesBond(props);
	}
	get id() {
		return this.props.id ?? 'tiles';
	}
	get rootId() {
		return Kernel.id(this.id, 'tiles-root');
	}
	get triggerId() {
		return Kernel.id(this.id, 'tiles-trigger');
	}
	get value() {
		return this.props.value ?? '';
	}

	bindCommit(commit: StateChangeCallback<string, TilesBond>) {
		this.#commit = commit;
	}
	select(value: string, event?: Event) {
		if (value === this.value) return;
		// Root-owned props can be getter-only. The root owns the write and callback.
		if (this.#commit) this.#commit(value, { bond: this, ...(event ? { event } : {}) });
		else this.props.value = value; // Standalone state owns its mutable props.
	}
}
