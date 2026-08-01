import { call } from './function';

export function promiseToState<T>(promise: Promise<T> | (() => Promise<T>)) {
	let data = $state<T | null>(null);

	const refresh = async () => {
		const result = (await call(promise)) as T;
		data = result;
	};

	$effect(() => {
		refresh();
	});

	return {
		get promise() {
			return promise;
		},
		get current() {
			return data;
		},
		refresh
	};
}

export function promiseWithResolvers<T>() {
	let resolve: ((value: T) => void) | null = null;
	let reject: ((reason?: unknown) => void) | null = null;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return {
		promise,
		get resolve() {
			return resolve!;
		},
		get reject() {
			return reject!;
		}
	};
}
