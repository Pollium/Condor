const SPANISH: Record<string, string> = {
    'open.menu': 'Abrir menú',
    'close.menu': 'Cerrar menú',
    'clear.all': 'Quitar todo',
    'clear.selection': 'Quitar selección'
};

export const translate = (id: string) => SPANISH[id] ?? id;
