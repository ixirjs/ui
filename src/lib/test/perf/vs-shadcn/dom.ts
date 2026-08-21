/**
 * Output census for a rendered HTML string.
 *
 * Counted on the string rather than in a DOM because the string IS the server's product, and
 * because a DOM parser drops exactly the nodes that matter here: hydration anchors survive parsing,
 * but `<table>` foster-parenting and implied `<tbody>` rewrite the tree, so two sides would be
 * compared through different repairs.
 */
export type Census = {
	bytes: number;
	/** Hydration anchors — comment nodes. The axis the anchor diet exists to move. */
	comments: number;
	/** Bytes spent on comment nodes alone: abstraction overhead, net of class-string length. */
	commentBytes: number;
	elements: number;
	/** Tag + role/aria skeleton, ignoring classes, ids, data-* and comments. */
	skeleton: string;
};

const COMMENT = /<!--[\s\S]*?-->/g;
const TAG = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
/** `role` and `aria-*` are the semantics a parity claim rests on; everything else is styling. */
const SEMANTIC = /\b(role|aria-[a-z-]+|type|hidden|tabindex)\s*=\s*"([^"]*)"/g;

export function census(html: string): Census {
	const comments = html.match(COMMENT) ?? [];
	const bare = html.replace(COMMENT, '');

	const parts: string[] = [];
	let elements = 0;
	for (const match of bare.matchAll(TAG)) {
		elements++;
		const tag = match[1]!;
		const semantics = [...(match[2] ?? '').matchAll(SEMANTIC)].map(
			([, key, value]) => `${key}=${value}`
		);
		parts.push(semantics.length > 0 ? `${tag}[${semantics.sort().join(',')}]` : tag);
	}

	return {
		bytes: html.length,
		comments: comments.length,
		commentBytes: comments.reduce((sum, comment) => sum + comment.length, 0),
		elements,
		skeleton: parts.join('>')
	};
}
