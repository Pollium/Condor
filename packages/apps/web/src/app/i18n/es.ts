export default {
    periods: {
        '24h': 'Últimas 24 horas',
        '7d': 'Últimos 7 días',
        '30d': 'Últimos 30 días',
        '90d': 'Últimos 90 días'
    },
    period: 'Periodo',
    skipToContent: 'Ir al contenido',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    switchApp: 'Cambiar de app',
    chooseApp: 'Elige una app',
    addApp: 'Añadir una app',
    addAppEllipsis: 'Añadir una app…',
    liveNow: (count: number, app: string) => `${count} ${count === 1 ? 'persona' : 'personas'} en ${app} ahora`,
    live: (count: number) => `${count} en vivo`,
    search: 'Buscar',
    lightTheme: 'Usar tema claro',
    darkTheme: 'Usar tema oscuro',
    account: 'Cuenta',
    yourAccount: 'Tu cuenta',
    team: 'Equipo',
    signOut: 'Cerrar sesión',
    navigation: 'Navegación',
    settings: 'Ajustes'
};
