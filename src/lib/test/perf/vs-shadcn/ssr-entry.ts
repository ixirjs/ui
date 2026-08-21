// Module entry for the client benchmark's hydrate leg: the driver renders these in node and hands
// the markup to the page. Hydrating client-rendered or hand-written HTML would skip the very
// anchors hydration walks, which is the axis this comparison exists to price.
export { FAMILIES } from './families.js';
