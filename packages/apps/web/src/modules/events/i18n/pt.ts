import type es from '@/modules/events/i18n/es';
import { fmt } from '@/shared/utils/format';

const pt: typeof es = {
    page: {
        count: (count: number) => count === 1 ? '1 evento personalizado neste período' : `${fmt.n(count)} eventos personalizados neste período`,
        list: 'Eventos personalizados',
        emptyTitle: 'Ainda não há eventos personalizados',
        emptyHint: 'Chame condor.track("nome", { ... }) no seu app ou envie-os do seu servidor, e eles aparecerão aqui.'
    },
    detail: {
        noPrevious: 'sem dados do período anterior',
        vsPrevious: (change: string) => `${change} vs. o período anterior`,
        times: 'Vezes',
        people: 'Pessoas',
        perPerson: 'Por pessoa',
        overTime: 'Ao longo do tempo',
        properties: 'Propriedades',
        property: 'Propriedade',
        noProperties: 'Este evento chega sem propriedades.',
        counting: 'Contando os valores…',
        valuesOf: (key: string) => `Valores de ${key}`
    },
    segment: {
        label: 'Pessoas',
        everyone: 'Todas as pessoas'
    }
};

export default pt;
