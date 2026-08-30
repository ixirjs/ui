import { onDestroy } from 'svelte';
import type { ValidationError } from '$ixirjs/ui/capability/models/validation.svelte';
import { flattenErrorRecord, type ErrorRecord, type ValidationSource } from '$ixirjs/ui/validation';

/**
 * Superforms integration.
 *
 * Typed structurally against the store shapes rather than importing `sveltekit-superforms`, so this
 * costs no dependency, no peer dependency, and does not break when their types move. Anything that
 * exposes the same four readables works — felte, a hand-rolled store, a remote form action.
 */

type Unsubscribe = (() => void) | { unsubscribe(): void };

export interface ReadableLike<T> {
	subscribe(run: (value: T) => void): Unsubscribe;
}

export interface SuperFormLike<Data extends Record<string, unknown> = Record<string, unknown>> {
	form: ReadableLike<Data>;
	errors: ReadableLike<ErrorRecord>;
	submitting?: ReadableLike<boolean>;
}

function stop(handle: Unsubscribe): void {
	if (typeof handle === 'function') handle();
	else handle.unsubscribe();
}

/**
 * Bridge a `superForm(...)` return value into a `ValidationSource`.
 *
 * ```svelte
 * const sf = superForm(data.form);
 * <Form.Root source={superformsSource(sf)} renderless>
 * ```
 *
 * Superforms owns the values, the errors and the submit lifecycle, so the form defers on all three
 * and validates nothing itself. Keep `renderless` and put Superforms' own `use:enhance` on your
 * `<form>` — that is the action that makes progressive enhancement work, and a Svelte action cannot
 * be forwarded through a component boundary.
 */
export function superformsSource<Data extends Record<string, unknown>>(
	superform: SuperFormLike<Data>
): ValidationSource {
	let errors = $state<ValidationError[]>([]);
	let values = $state<Record<string, unknown>>({});
	let submitting = $state(false);

	// Stores emit synchronously on subscribe, so the first read is correct during SSR too.
	const handles = [
		superform.errors.subscribe((next) => {
			errors = flattenErrorRecord(next);
		}),
		superform.form.subscribe((next) => {
			values = next ?? {};
		})
	];
	if (superform.submitting) {
		handles.push(
			superform.submitting.subscribe((next) => {
				submitting = next;
			})
		);
	}

	// Outside a component (a test, a module scope) there is nothing to hang teardown on; the caller
	// owns the lifetime then. Same shape as `Bond.getOptional`.
	try {
		onDestroy(() => handles.forEach(stop));
	} catch {
		/* not in component init */
	}

	return {
		get errors() {
			return errors;
		},
		get values() {
			return values;
		},
		get isSubmitting() {
			return submitting;
		}
	};
}
