<script lang="ts">
	import type { PropDefinition } from '$docs/types';

	interface Props {
		props: PropDefinition[];
	}

	let { props }: Props = $props();

	function row(item: PropDefinition) {
		return `| **${item.name}** | \`${item.type}\` | \`${item.default}\` | ${item.description} |`;
	}

	function rows(items: PropDefinition[]) {
		return items.map(row).join('\n');
	}
</script>

<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
{'\n'}
| name | type | default | description | | --- | --- | --- | --- |
{rows(props)}
