// Minimal `$app/environment` stand-in. The SSR benchmark builds outside SvelteKit so that the
// profile and timings show library frames rather than Kit's request pipeline.
export const browser = false;
export const dev = false;
export const building = false;
export const version = 'bench';
