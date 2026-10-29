const EMPTY = 5;
const PEAK = 92;

export const mixFill = (mix: number) => `color-mix(in oklab, var(--accent) ${mix}%, var(--fill))`;

export const heatFill = (share: number) => mixFill(share <= 0 ? EMPTY : EMPTY + Math.min(share, 1) * (PEAK - EMPTY));
