import { colorScheme, type ColorScheme } from '$lib/runes';
import { createContext } from 'svelte';

const [get, set] = createContext<Theme>();

/**
 * The scheme `app.html`'s inline script already applied, so the class it put on `<html>` survives
 * hydration. Without this the stored preference was read once before paint and then thrown away by
 * the effect below, which is why the toggle never persisted across a reload.
 */
function storedColorScheme(): ColorScheme | undefined {
	if (typeof localStorage === 'undefined') return undefined;
	const value = localStorage.getItem('color-scheme');
	return value === 'dark' || value === 'light' ? value : undefined;
}

export class Theme {
	#systemColorScheme = colorScheme();
	#userColorScheme: ColorScheme | undefined = $state(storedColorScheme());

	constructor() {
		$effect(() => {
			if (this.colorScheme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		});
	}

	get systemColorScheme() {
		return this.#systemColorScheme;
	}

	get userColorScheme() {
		return this.#userColorScheme;
	}

	set userColorScheme(value: ColorScheme | undefined) {
		this.#userColorScheme = value;
		if (value) {
			localStorage.setItem('color-scheme', value);
		} else {
			localStorage.removeItem('color-scheme');
		}
	}

	get colorScheme() {
		return this.userColorScheme ?? this.systemColorScheme.current;
	}

	share() {
		return Theme.set(this);
	}

	toggle() {
		this.userColorScheme = this.colorScheme === 'dark' ? 'light' : 'dark';
	}

	static get = get;
	static set = set;
}
