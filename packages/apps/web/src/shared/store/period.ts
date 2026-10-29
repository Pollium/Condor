import { Period, PERIODS } from '@condor/contracts/shared/period';
import { create } from 'zustand';

const KEY = 'condor.period';

const stored = (): Period => {
    try{
        const value = localStorage.getItem(KEY);
        return (PERIODS as readonly string[]).includes(value ?? '') ? value as Period : '7d';
    }catch{
        return '7d';
    }
};

interface PeriodState{
    period: Period;
    setPeriod: (period: Period) => void;
}

export const usePeriodStore = create<PeriodState>((set) => ({
    period: stored(),
    setPeriod: (period) => {
        try{
            localStorage.setItem(KEY, period);
        }catch{
            set({ period });
            return;
        }
        set({ period });
    }
}));
