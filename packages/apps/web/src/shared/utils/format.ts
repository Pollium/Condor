const number = new Intl.NumberFormat('es-CL');
const compact = new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat('es-CL', { style: 'percent', maximumFractionDigits: 1 });
const dayFormat = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' });
const timeFormat = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' });

export const fmt = {
    n: (value: number) => number.format(value),
    k: (value: number) => compact.format(value),
    pct: (value: number) => percent.format(value),
    clock: (seconds: number) => {
        const s = Math.max(0, Math.floor(seconds));
        return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    },
    duration: (seconds: number) => {
        const s = Math.round(seconds);
        if(s < 60) return `${s}s`;
        const m = Math.floor(s / 60);
        if(m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`;
        return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
    },
    signed: (value: number) => `${value > 0 ? '+' : ''}${percent.format(value)}`,
    ago: (iso: string, now = Date.now()) => {
        const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
        if(minutes < 1) return 'ahora';
        if(minutes < 60) return `hace ${minutes} min`;
        const hours = Math.round(minutes / 60);
        if(hours < 24) return `hace ${hours} h`;
        const days = Math.round(hours / 24);
        return days < 30 ? `hace ${days} d` : dayFormat.format(new Date(iso));
    },
    day: (iso: string) => dayFormat.format(new Date(iso)),
    time: (iso: string) => timeFormat.format(new Date(iso))
};
