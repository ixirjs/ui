<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Alert as AAlert } from '../index';
	import { Button } from '$svelte-atoms/core/components/button';
	import { Icon } from '$svelte-atoms/core/components/icon';

	const { Story } = defineMeta({
		title: 'Atoms/Alert',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			variant: 'info',
			dismissible: false,
			disabled: false
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['info', 'success', 'warning', 'error'],
				description: 'Visual style conveying the intent of the alert'
			},
			dismissible: {
				control: 'boolean',
				description: 'Whether the alert can be dismissed by the user'
			},
			disabled: {
				control: 'boolean',
				description: 'Disables all interaction with the alert'
			}
		}
	});
</script>

<script lang="ts">
	let dismissedState = $state(false);
	let autoHideState = $state(false);

	// Auto-hide after 5s once shown.
	$effect(() => {
		if (autoHideState) {
			const timer = setTimeout(() => {
				autoHideState = false;
			}, 5000);
			return () => clearTimeout(timer);
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="p-8">
			<AAlert.Root {...args}>
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M12 16v-4M12 8h.01"></path>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>New Feature Available</AAlert.Title>
				<AAlert.Description>
					We've added dark mode support to your dashboard. Try it out in the settings panel.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
				{#if args.dismissible}
					<AAlert.CloseButton>
						<Icon class="h-full">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</Icon>
					</AAlert.CloseButton>
				{/if}
			</AAlert.Root>
		</div>
	{/snippet}
</Story>

<Story name="All Variants">
	<div class="space-y-6 p-8">
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Alert Variants</h2>

			<AAlert.Root variant="info">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M12 16v-4M12 8h.01"></path>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>New Feature Available</AAlert.Title>
				<AAlert.Description>
					We've added dark mode support to your dashboard. Try it out in the settings panel.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
			</AAlert.Root>

			<AAlert.Root variant="success">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
						<polyline points="22 4 12 14.01 9 11.01"></polyline>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Changes Saved Successfully</AAlert.Title>
				<AAlert.Description>
					Your profile settings have been updated and synced across all devices.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
			</AAlert.Root>

			<AAlert.Root variant="warning">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
						></path>
						<line x1="12" y1="9" x2="12" y2="13"></line>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Storage Almost Full</AAlert.Title>
				<AAlert.Description>
					You're using 90% of your storage quota. Consider upgrading your plan or removing unused
					files.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
			</AAlert.Root>

			<AAlert.Root variant="error">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="15" y1="9" x2="9" y2="15"></line>
						<line x1="9" y1="9" x2="15" y2="15"></line>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Payment Failed</AAlert.Title>
				<AAlert.Description>
					We couldn't process your payment. Please check your payment method and try again.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
			</AAlert.Root>
		</div>
	</div>
</Story>

<Story name="Dismissible">
	<div class="space-y-6 p-8">
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Dismissible Alerts</h2>

			<AAlert.Root variant="info" dismissible dismissed={dismissedState}>
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M12 16v-4M12 8h.01"></path>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Cookie Preferences</AAlert.Title>
				<AAlert.Description>
					We use cookies to enhance your experience. You can manage your preferences in settings.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
				<AAlert.CloseButton>
					<Icon class="h-full">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</Icon>
				</AAlert.CloseButton>
			</AAlert.Root>

			{#if dismissedState}
				<Button onclick={() => (dismissedState = false)}>Restore Alert</Button>
			{/if}

			<AAlert.Root variant="warning" dismissible>
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
						></path>
						<line x1="12" y1="9" x2="12" y2="13"></line>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Beta Feature Warning</AAlert.Title>
				<AAlert.Description>
					You're using a beta feature. Some functionality may be unstable or change without notice.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
				<AAlert.CloseButton>
					<Icon class="h-full">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</Icon>
				</AAlert.CloseButton>
			</AAlert.Root>
		</div>
	</div>
</Story>

<Story name="With Actions">
	<div class="space-y-6 p-8">
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Alerts with Action Buttons</h2>

			<AAlert.Root variant="info">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
						<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>System Update Available</AAlert.Title>
				<AAlert.Description>
					A new version is ready to install. Update now to get the latest features and security
					improvements.
				</AAlert.Description>
				<AAlert.Actions>
					<Button variant="primary" size="sm">Update Now</Button>
					<Button variant="ghost" size="sm">Remind Me Later</Button>
				</AAlert.Actions>
				<AAlert.Content></AAlert.Content>
			</AAlert.Root>

			<AAlert.Root variant="error" dismissible>
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="15" y1="9" x2="9" y2="15"></line>
						<line x1="9" y1="9" x2="15" y2="15"></line>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Verification Required</AAlert.Title>
				<AAlert.Description>
					Your account needs verification before you can access premium features.
				</AAlert.Description>
				<AAlert.Actions>
					<Button variant="destructive" size="sm">Verify Account</Button>
					<Button variant="outline" size="sm">Learn More</Button>
				</AAlert.Actions>
				<AAlert.Content></AAlert.Content>
				<AAlert.CloseButton>
					<Icon class="h-full">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</Icon>
				</AAlert.CloseButton>
			</AAlert.Root>

			<AAlert.Root variant="success">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
						<polyline points="22 4 12 14.01 9 11.01"></polyline>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Backup Completed</AAlert.Title>
				<AAlert.Description>
					All your data has been backed up successfully. Last backup: just now.
				</AAlert.Description>
				<AAlert.Actions>
					<Button variant="outline" size="sm">View Details</Button>
				</AAlert.Actions>
				<AAlert.Content></AAlert.Content>
			</AAlert.Root>
		</div>
	</div>
</Story>

<Story name="Minimal">
	<div class="space-y-6 p-8">
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Minimal Alerts</h2>

			<AAlert.Root variant="info">
				<AAlert.Content>Quick tip: Press Ctrl+K to open the command palette.</AAlert.Content>
			</AAlert.Root>

			<AAlert.Root variant="success">
				<AAlert.Content>Your changes have been saved automatically.</AAlert.Content>
			</AAlert.Root>

			<AAlert.Root variant="warning">
				<AAlert.Content>Your session will expire in 5 minutes.</AAlert.Content>
				<AAlert.Content></AAlert.Content>
			</AAlert.Root>

			<AAlert.Root variant="error">
				<AAlert.Content>Connection lost. Attempting to reconnect...</AAlert.Content>
			</AAlert.Root>
		</div>
	</div>
</Story>

<Story name="Real-World Examples">
	<div class="space-y-6 p-8">
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Real-World Use Cases</h2>

			<!-- Newsletter Subscription -->
			<AAlert.Root variant="success" dismissible>
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
						></path>
						<polyline points="22,6 12,13 2,6"></polyline>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Successfully Subscribed!</AAlert.Title>
				<AAlert.Description>
					You're now subscribed to our newsletter. Check your inbox for a confirmation email.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
				<AAlert.CloseButton>
					<Icon class="h-full">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</Icon>
				</AAlert.CloseButton>
			</AAlert.Root>

			<!-- API Rate Limit -->
			<AAlert.Root variant="warning">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<polyline points="12 6 12 12 16 14"></polyline>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>API Rate Limit Warning</AAlert.Title>
				<AAlert.Description>
					You've used 450 of 500 API calls this hour. Rate limit resets in 23 minutes.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
				<AAlert.Actions>
					<Button variant="primary" size="sm">Upgrade Plan</Button>
					<Button variant="ghost" size="sm">View Usage</Button>
				</AAlert.Actions>
			</AAlert.Root>

			<!-- Maintenance Notice -->
			<AAlert.Root variant="info">
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
						></path>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Scheduled Maintenance</AAlert.Title>
				<AAlert.Description>
					Our services will be undergoing maintenance on Dec 15, 2025 from 2:00 AM to 4:00 AM UTC.
					Some features may be temporarily unavailable.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
				<AAlert.Actions>
					<Button variant="primary" size="sm">Add to Calendar</Button>
				</AAlert.Actions>
			</AAlert.Root>

			<!-- Security Alert -->
			<AAlert.Root variant="error" dismissible>
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
						<path d="M12 8v4M12 16h.01"></path>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Unusual Login Detected</AAlert.Title>
				<AAlert.Description>
					We detected a login from a new device in San Francisco, CA. If this wasn't you, secure
					your account immediately.
				</AAlert.Description>
				<AAlert.CloseButton>
					<Icon class="h-full">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</Icon>
				</AAlert.CloseButton>
				<AAlert.Content></AAlert.Content>
				<AAlert.Actions>
					<Button variant="destructive" size="sm">Secure Account</Button>
					<Button variant="ghost" size="sm">This Was Me</Button>
				</AAlert.Actions>
			</AAlert.Root>

			<!-- Trial Ending -->
			<AAlert.Root variant="warning" dismissible>
				<AAlert.Icon>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
				</AAlert.Icon>
				<AAlert.Title>Trial Ending Soon</AAlert.Title>
				<AAlert.Description>
					Your free trial ends in 3 days. Upgrade now to keep access to premium features and avoid
					any interruption.
				</AAlert.Description>
				<AAlert.Content></AAlert.Content>
				<AAlert.CloseButton>
					<Icon class="h-full">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</Icon>
				</AAlert.CloseButton>
				<AAlert.Actions>
					<Button variant="primary" size="sm">Upgrade Now</Button>
					<Button variant="ghost" size="sm">Compare Plans</Button>
				</AAlert.Actions>
			</AAlert.Root>
		</div>
	</div>
</Story>
