// The behaviour models — plain factories a family calls as ordinary functions.
//
// The capability protocol (`defineBondCapability`, `CapabilityHost`, role projections, slot keys)
// was deleted with the Bond/Atom runtime: a migrated family calls `createSelection` /
// `createDisclosure` / … directly and writes the ARIA and `data-*` projections literally in each
// part's `attrs`. What is left is state, not registration.
export * from './models';
