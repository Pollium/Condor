export interface RetrySpacing{
    floorMs: number;
    ceilingMs: number;
}

export const retryDelayMs = (
    attempt: number,
    spacing: RetrySpacing
): number => {
    const { floorMs, ceilingMs } = spacing;
    const spaced = Math.min(ceilingMs, floorMs * 2 ** Math.max(0, attempt - 1));
    
    return Math.round(spaced * (0.75 + Math.random() * 0.5));
};