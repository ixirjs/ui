import { createContext, type Component } from 'svelte';
import { nanoid } from 'nanoid';
import { SvelteMap } from 'svelte/reactivity';

export type ToastType = 'info' | 'success' | 'error' | 'warning' | 'default';

export interface ToastItem<T = unknown> {
	id: string;
	type: ToastType;
	duration: number;
	dismissible: boolean;
	component?: Component<{ item: ToastItem<T> }> | undefined;
	data?: T | undefined;
}

export interface ToastOptions<T = unknown> {
	id?: string;
	duration?: number;
	dismissible?: boolean;
	// Arbitrary payload accessible from a custom toast component via `item.data`.
	data?: T;
	// Custom component to render in place of the default toast layout. Receives `{ item }`.
	component?: Component<{ item: ToastItem<T> }>;
}

interface TimerEntry {
	handle: ReturnType<typeof setTimeout> | null;
	start: number;
	remaining: number;
}

const DEFAULT_DURATION = 4000;

const [get, set] = createContext<Toaster>();

/**
 * Reactive store for imperatively-managed toasts. Toast is deliberately a building-blocks
 * component: this store owns the item list + auto-dismiss timers, but the **render loop and
 * position live in your markup** — you iterate {@link Toaster.toasts} into `<Toast.Root>`s
 * inside a region element you own.
 *
 * Containment contract: a toast must render *above* any modal, never clipped
 * by its stacking/scroll context. Because the region is user-land, that is your
 * responsibility — place the region at the app root, or teleport it to the root Portal and
 * give it the ambient layer:
 *
 * ```svelte
 * <Teleport portal="root.l0">
 *   {@const layer = new ZLayer('ambient')}
 *   <ol class="fixed bottom-4 right-4 …" style="z-index: {layer.value}" aria-live="polite">
 *     {#each toaster.toasts as item (item.id)}
 *       <Toast.Root open onclose={() => toaster.dismiss(item.id)}>…</Toast.Root>
 *     {/each}
 *   </ol>
 * </Teleport>
 * ```
 *
 * Do NOT teleport an individual `<Toast.Root>` — it would tear out of the region's stack
 * layout. Teleport + ZLayer belong to the region, not the item.
 */
export class Toaster {
	#toasts = new SvelteMap<string, ToastItem>();
	#toastsArray = $derived([...this.#toasts.values()]);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#timers = new Map<string, TimerEntry>();

	get toasts(): ToastItem[] {
		return this.#toastsArray;
	}

	add<T = unknown>(type: ToastType = 'default', options: ToastOptions<T> = {}): string {
		const id = options.id ?? nanoid(8);

		// Existing id: update in place.
		const existing = this.#toasts.get(id);
		if (existing) {
			existing.type = type;
			if (options.dismissible !== undefined) existing.dismissible = options.dismissible;
			if (options.data !== undefined) existing.data = options.data;
			if (options.component !== undefined)
				existing.component = options.component as Component<{ item: ToastItem }>;
			if (options.duration !== undefined) {
				existing.duration = options.duration;
				if (options.duration > 0) this.#startTimer(id, options.duration);
				else this.#clearTimer(id);
			}
			return id;
		}

		const duration = options.duration ?? DEFAULT_DURATION;
		const dismissible = options.dismissible ?? true;

		const item: ToastItem<T> = {
			id,
			type,
			duration,
			dismissible,
			data: options.data,
			component: options.component
		};

		this.#toasts.set(id, item as ToastItem);

		if (duration > 0) this.#startTimer(id, duration);

		return id;
	}

	dismiss(...ids: string[]) {
		for (const id of ids) {
			this.#clearTimer(id);
			this.#toasts.delete(id);
		}
	}

	// Pause auto-dismiss timer (e.g. on pointerenter).
	pause(...ids: string[]) {
		for (const id of ids) {
			const t = this.#timers.get(id);
			if (!t || t.handle === null) continue;
			clearTimeout(t.handle);
			const elapsed = Date.now() - t.start;
			t.remaining = Math.max(0, t.remaining - elapsed);
			t.handle = null;
		}
	}

	// Resume previously paused auto-dismiss timer.
	resume(...ids: string[]) {
		for (const id of ids) {
			const t = this.#timers.get(id);
			if (!t || t.handle !== null || t.remaining <= 0) continue;
			t.start = Date.now();
			t.handle = setTimeout(() => this.dismiss(id), t.remaining);
		}
	}

	remove(...ids: string[]) {
		for (const id of ids) {
			this.#clearTimer(id);
			this.#toasts.delete(id);
		}
	}

	clear() {
		for (const id of [...this.#timers.keys()]) this.#clearTimer(id);
		this.#toasts.clear();
	}

	#startTimer(id: string, ms: number) {
		this.#clearTimer(id);
		const handle = setTimeout(() => this.dismiss(id), ms);
		this.#timers.set(id, { handle, start: Date.now(), remaining: ms });
	}

	#clearTimer(id: string) {
		const t = this.#timers.get(id);
		if (t?.handle != null) clearTimeout(t.handle);
		this.#timers.delete(id);
	}

	share() {
		return Toaster.set(this);
	}

	static get = get;
	static set = set;
}
