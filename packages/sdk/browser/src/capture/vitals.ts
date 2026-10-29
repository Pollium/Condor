import { Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { Emit } from '../types';

export const trackVitals = (emit: Emit) => {
    const report = (metric: Metric) => emit({
        type: 'vital',
        name: metric.name,
        value: Math.round(metric.value * 1000) / 1000,
        rating: metric.rating
    });
    onLCP(report);
    onINP(report);
    onCLS(report);
    onFCP(report);
    onTTFB(report);
};
