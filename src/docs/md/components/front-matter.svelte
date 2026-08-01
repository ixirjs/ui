<script lang="ts">
	import type { Frontmatter } from '$docs/md/frontmatter';
	import { newLine } from '../template';

	let { frontmatter }: { frontmatter: Frontmatter } = $props();

	const yaml = $derived(buildYaml(frontmatter));

	function buildYaml(fm: Frontmatter): string {
		const lines = ['---'];

		lines.push(`id: ${fm.id}`);
		lines.push(`title: ${fm.title}`);
		lines.push(`category: ${fm.category}`);

		if (fm.subcategory) lines.push(`subcategory: ${fm.subcategory}`);
		lines.push(`depth: ${fm.depth}`);
		if (fm.prerequisites?.length) {
			lines.push('prerequisites:');
			fm.prerequisites.forEach((p) => lines.push(`  - ${p}`));
		}
		if (fm.related?.length) {
			lines.push('related:');
			fm.related.forEach((r) => lines.push(`  - ${r}`));
		}

		lines.push('---');

		return lines.join('\n');
	}
</script>

{yaml + newLine() + newLine()}
