import { colorScheme, type ColorScheme } from '$lib/runes';
import { createContext } from 'svelte';

const [get, set] = createContext<Theme>();

export class Theme {
	#systemColorScheme = colorScheme();
	#userColorScheme: ColorScheme | undefined = $state('light');

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
