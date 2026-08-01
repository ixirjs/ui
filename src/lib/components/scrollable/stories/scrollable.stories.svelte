<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Scrollable as Scrollable_ } from '..';
	import { animate } from 'motion';
	import { ScrollableBond } from '../bond.svelte';
	import { on } from '$svelte-atoms/core/attachments/event.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Scrollable',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			disabled: false,
			open: false
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Disable scrollbar interaction'
			},
			open: {
				control: 'boolean',
				description: 'Force the custom scrollbar tracks to be visible'
			}
		}
	});
</script>

<script lang="ts">
	const messages = [
		{
			id: 1,
			sender: 'Alice',
			avatar: 'A',
			time: '9:01 AM',
			text: 'Hey team! Just pushed the new design tokens to the repo.'
		},
		{
			id: 2,
			sender: 'Bob',
			avatar: 'B',
			time: '9:03 AM',
			text: "Nice! I'll pull and integrate them into the component library."
		},
		{
			id: 3,
			sender: 'Alice',
			avatar: 'A',
			time: '9:05 AM',
			text: 'Make sure to check the color contrast ratios — accessibility is a priority.'
		},
		{
			id: 4,
			sender: 'Charlie',
			avatar: 'C',
			time: '9:08 AM',
			text: 'I can run the a11y audit once the tokens are integrated. Also, the client wants to see a progress update by 3pm.'
		},
		{
			id: 5,
			sender: 'Bob',
			avatar: 'B',
			time: '9:10 AM',
			text: 'Should be ready by noon. The button variants are done, working on form inputs now.'
		},
		{
			id: 6,
			sender: 'Alice',
			avatar: 'A',
			time: '9:12 AM',
			text: "Great. I'll prepare the presentation deck in the meantime."
		},
		{
			id: 7,
			sender: 'Charlie',
			avatar: 'C',
			time: '9:15 AM',
			text: "Don't forget to include the before/after comparison screenshots."
		},
		{
			id: 8,
			sender: 'Bob',
			avatar: 'B',
			time: '9:20 AM',
			text: 'Question: should the disabled state use opacity or a different background color?'
		},
		{
			id: 9,
			sender: 'Alice',
			avatar: 'A',
			time: '9:22 AM',
			text: 'Opacity 50% + pointer-events none. Keeps it consistent across all components.'
		},
		{
			id: 10,
			sender: 'Charlie',
			avatar: 'C',
			time: '9:25 AM',
			text: 'Agreed. Less visual noise that way. Also, the spacing tokens look fantastic on mobile.'
		},
		{
			id: 11,
			sender: 'Bob',
			avatar: 'B',
			time: '9:30 AM',
			text: 'Forms are done! Moving on to the select and combobox now.'
		},
		{
			id: 12,
			sender: 'Alice',
			avatar: 'A',
			time: '9:32 AM',
			text: 'Remember the select needs both single and multi-select variants.'
		},
		{
			id: 13,
			sender: 'Charlie',
			avatar: 'C',
			time: '9:35 AM',
			text: "I've added some test cases for keyboard navigation in the PR review."
		},
		{
			id: 14,
			sender: 'Bob',
			avatar: 'B',
			time: '9:40 AM',
			text: "Thanks! I'll address the review comments after lunch."
		},
		{
			id: 15,
			sender: 'Alice',
			avatar: 'A',
			time: '9:45 AM',
			text: "Team standup in 15 minutes — let's sync up there."
		},
		{
			id: 16,
			sender: 'Charlie',
			avatar: 'C',
			time: '9:47 AM',
			text: "Sounds good. I'll share the test coverage report."
		},
		{
			id: 17,
			sender: 'Bob',
			avatar: 'B',
			time: '9:50 AM',
			text: 'Quick heads up: I found a z-index issue with the popover inside dialogs. Will fix after standup.'
		},
		{
			id: 18,
			sender: 'Alice',
			avatar: 'A',
			time: '9:52 AM',
			text: 'Good catch. That might be related to the portal layer changes we made last week.'
		}
	];

	const avatarColors: Record<string, string> = {
		A: 'bg-blue-500',
		B: 'bg-emerald-500',
		C: 'bg-amber-500'
	};
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex h-screen w-full items-center justify-center p-6">
			<div
				class="border-border bg-card flex h-150 w-full max-w-lg flex-col rounded-xl border shadow-lg"
			>
				<div class="border-border flex items-center gap-3 border-b px-4 py-3">
					<div class="bg-emerald-500 h-2.5 w-2.5 rounded-full"></div>
					<h3 class="text-foreground text-sm font-semibold">Design Team Chat</h3>
					<span class="text-muted-foreground ml-auto text-xs">{messages.length} messages</span>
				</div>

				<Scrollable_.Root
					class="flex min-h-0 flex-1"
					disabled={args.disabled}
					open={args.open}
					{@attach (node: HTMLElement) => {
						if (args.open) return;
						const scrollable = ScrollableBond.get();
						if (!scrollable) return;

						const c1 = on('pointerenter', () => {
							scrollable.state.props.open = true;
						})(node);

						const c2 = on('pointerleave', () => {
							scrollable.state.props.open = false;
						})(node);

						return () => {
							c1();
							c2();
						};
					}}
				>
					<Scrollable_.Container class="flex-1">
						<Scrollable_.Content class="flex flex-col gap-3 p-4">
							{#each messages as msg (msg.id)}
								<div class="flex gap-3">
									<div
										class={[
											'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
											avatarColors[msg.avatar]
										]}
									>
										{msg.avatar}
									</div>
									<div class="min-w-0 flex-1">
										<div class="flex items-baseline gap-2">
											<span class="text-foreground text-sm font-medium">{msg.sender}</span>
											<span class="text-muted-foreground text-xs">{msg.time}</span>
										</div>
										<p class="text-foreground/80 mt-0.5 text-sm leading-relaxed">{msg.text}</p>
									</div>
								</div>
							{/each}
						</Scrollable_.Content>
					</Scrollable_.Container>

					<Scrollable_.Track
						orientation="vertical"
						class="inset-y-0 right-0 w-0.5 rounded-md"
						initial={(node: HTMLElement) => {
							animate(node, { opacity: 0, right: 0, top: 0, bottom: 0 }, { duration: 0 });
						}}
						enter={(node: HTMLElement) => {
							animate(
								node,
								{ opacity: 1, right: 6, top: 6, bottom: 6 },
								{ duration: 0.3, ease: 'easeOut' }
							);
							return { duration: 300 };
						}}
						exit={(node: HTMLElement) => {
							animate(
								node,
								{ opacity: 0, right: 0, top: 0, bottom: 0 },
								{ duration: 0.3, ease: 'easeOut' }
							);
							return { duration: 300 };
						}}
					>
						<Scrollable_.Thumb
							orientation="vertical"
							class="bg-foreground/20 hover:bg-foreground/30 left-[50%] w-1.5 origin-center translate-x-[-50%] rounded-full transition-colors"
						/>
					</Scrollable_.Track>
				</Scrollable_.Root>

				<div class="border-border flex items-center gap-2 border-t px-4 py-3">
					<input
						type="text"
						placeholder="Type a message..."
						class="bg-muted text-foreground placeholder:text-muted-foreground flex-1 rounded-lg px-3 py-2 text-sm outline-none"
					/>
					<button
						class="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Simple Debug">
	<div class="flex h-screen w-full items-center justify-center bg-muted p-6">
		<Scrollable_.Root class="border relative h-96 w-96 border-black" open={true}>
			{#snippet children({ scrollable })}
				<div class="bg-blue-200 absolute left-0 top-0 z-50 p-2 text-xs">
					<p>Scroll Y: {scrollable.state.props.scrollY}</p>
					<p>Scroll Height: {scrollable.state.props.scrollHeight}</p>
					<p>Client Height: {scrollable.state.props.clientHeight}</p>
					<p>Can Scroll Y: {scrollable.canScrollY}</p>
				</div>

				<Scrollable_.Container class="h-full">
					<Scrollable_.Content class="flex flex-col gap-4 p-4">
						{#each Array(50) as _, i (i)}
							<div class="bg-white p-4 shadow">Item {i + 1}</div>
						{/each}
					</Scrollable_.Content>
				</Scrollable_.Container>

				<Scrollable_.Track orientation="vertical" class="bg-yellow-300">
					<Scrollable_.Thumb orientation="vertical" class="!bg-red-500 !opacity-100" />
				</Scrollable_.Track>
			{/snippet}
		</Scrollable_.Root>
	</div>
</Story>
