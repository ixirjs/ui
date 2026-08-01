<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { Playground } from '$docs/playground';

	let formData = $state({
		name: '',
		email: '',
		message: '',
		subscribe: false
	});

	let selectedVariant = $state('default');
	let selectedSize = $state('default');
	let isDisabled = $state(false);

	const variants = [
		{ label: 'Default', value: 'default' },
		{ label: 'Card', value: 'card' },
		{ label: 'Inline', value: 'inline' }
	];

	const sizes = [
		{ label: 'Small', value: 'sm' },
		{ label: 'Default', value: 'default' },
		{ label: 'Large', value: 'lg' }
	];

	function handleSubmit(event: Event) {
		event.preventDefault();
		console.log('Form submitted:', formData);
	}

	function resetForm() {
		formData = {
			name: '',
			email: '',
			message: '',
			subscribe: false
		};
	}
</script>

<section class="mb-12">
	<h2 class="mb-6 text-2xl font-bold text-gray-900">Interactive Playground</h2>

	<Playground.Root>
		<Playground.Preview>
			<div class="flex items-center justify-center p-8">
				<div
					class={`w-full max-w-md ${selectedVariant === 'card' ? 'border-border rounded-lg border bg-white p-6 shadow-sm' : ''}`}
				>
					<form
						class={`space-y-4 ${selectedSize === 'sm' ? 'text-sm' : selectedSize === 'lg' ? 'text-lg' : ''}`}
						onsubmit={handleSubmit}
					>
						<div>
							<label for="name" class="mb-1 block text-sm font-medium text-gray-700"> Name </label>
							<input
								id="name"
								type="text"
								bind:value={formData.name}
								placeholder="Enter your name"
								disabled={isDisabled}
								class={`border-border w-full rounded-md border px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
									selectedSize === 'sm'
										? 'px-2 py-1 text-xs'
										: selectedSize === 'lg'
											? 'px-4 py-3 text-base'
											: ''
								}`}
							/>
						</div>

						<div>
							<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
								Email
							</label>
							<input
								id="email"
								type="email"
								bind:value={formData.email}
								placeholder="Enter your email"
								disabled={isDisabled}
								class={`border-border w-full rounded-md border px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
									selectedSize === 'sm'
										? 'px-2 py-1 text-xs'
										: selectedSize === 'lg'
											? 'px-4 py-3 text-base'
											: ''
								}`}
							/>
						</div>

						<div>
							<label for="message" class="mb-1 block text-sm font-medium text-gray-700">
								Message
							</label>
							<textarea
								id="message"
								bind:value={formData.message}
								placeholder="Enter your message"
								rows="3"
								disabled={isDisabled}
								class={`border-border w-full resize-none rounded-md border px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
									selectedSize === 'sm'
										? 'px-2 py-1 text-xs'
										: selectedSize === 'lg'
											? 'px-4 py-3 text-base'
											: ''
								}`}></textarea>
						</div>

						<div class="flex items-center space-x-2">
							<input
								id="subscribe"
								type="checkbox"
								bind:checked={formData.subscribe}
								disabled={isDisabled}
								class="border-border rounded text-purple-600 focus:ring-purple-500 disabled:opacity-50"
							/>
							<label for="subscribe" class="text-sm text-gray-700"> Subscribe to newsletter </label>
						</div>

						<div class={`flex space-x-3 ${selectedVariant === 'inline' ? 'flex-row' : 'flex-col'}`}>
							<Button
								type="submit"
								class={`bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 ${
									selectedSize === 'sm'
										? 'px-3 py-1.5 text-xs'
										: selectedSize === 'lg'
											? 'px-6 py-3 text-base'
											: 'px-4 py-2 text-sm'
								}`}
								disabled={isDisabled}
							>
								Submit
							</Button>
							<Button
								type="button"
								onclick={resetForm}
								class={`border-border border text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 ${
									selectedSize === 'sm'
										? 'px-3 py-1.5 text-xs'
										: selectedSize === 'lg'
											? 'px-6 py-3 text-base'
											: 'px-4 py-2 text-sm'
								}`}
								disabled={isDisabled}
							>
								Reset
							</Button>
						</div>
					</form>
				</div>
			</div>
		</Playground.Preview>

		<Playground.Controls>
			<Playground.Header>Customize Form</Playground.Header>

			<div class="space-y-4">
				<div>
					<label for="variant-select" class="mb-2 block text-sm font-medium text-gray-700"
						>Variant</label
					>
					<select
						id="variant-select"
						bind:value={selectedVariant}
						class="border-border w-full rounded-md border px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
					>
						{#each variants as variant, i (i)}
							<option value={variant.value}>{variant.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="size-select" class="mb-2 block text-sm font-medium text-gray-700">Size</label>
					<select
						id="size-select"
						bind:value={selectedSize}
						class="border-border w-full rounded-md border px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
					>
						{#each sizes as size, i (i)}
							<option value={size.value}>{size.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex items-center space-x-2">
					<input
						id="disabled-checkbox"
						type="checkbox"
						bind:checked={isDisabled}
						class="border-border rounded text-purple-600 focus:ring-purple-500"
					/>
					<label for="disabled-checkbox" class="text-sm text-gray-700">Disabled</label>
				</div>
			</div>

			<div class="mt-6 rounded-lg bg-gray-50 p-4">
				<h4 class="mb-2 text-sm font-medium text-gray-700">Current Values:</h4>
				<pre class="text-xs whitespace-pre-wrap text-gray-600">{JSON.stringify(
						formData,
						null,
						2
					)}</pre>
			</div>
		</Playground.Controls>
	</Playground.Root>
</section>
