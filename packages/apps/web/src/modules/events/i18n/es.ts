import { fmt } from '@/shared/utils/format';

export default {
    page: {
        count: (count: number) => count === 1 ? '1 evento propio en este periodo' : `${fmt.n(count)} eventos propios en este periodo`,
        list: 'Eventos propios',
        emptyTitle: 'Aún no hay eventos propios',
        emptyHint: 'Llama a condor.track("nombre", { ... }) desde tu app o envíalos desde tu servidor y aparecerán aquí.'
    },
    detail: {
        noPrevious: 'sin datos del periodo anterior',
        vsPrevious: (change: string) => `${change} vs. el periodo anterior`,
        times: 'Veces',
        people: 'Personas',
        perPerson: 'Por persona',
        overTime: 'En el tiempo',
        properties: 'Propiedades',
        property: 'Propiedad',
        noProperties: 'Este evento llega sin propiedades.',
        counting: 'Contando los valores…',
        valuesOf: (key: string) => `Valores de ${key}`
    },
    segment: {
        label: 'Personas',
        everyone: 'Todas las personas'
    }
};
