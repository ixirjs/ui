import server from '../../../../../../scripts/bench.vite.config';
import client from '../../../../../../scripts/bench-client.vite.config';

// No source transforms: measure the shipped roots and item-construction seams directly.
export default process.env.POPUP_BENCH_TARGET === 'ssr' ? server : client;
