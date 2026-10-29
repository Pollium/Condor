export interface Product{
    slug: string;
    name: string;
    price: number;
    tone: string;
    blurb: string;
}

export const PRODUCTS: Product[] = [
    { slug: 'chaqueta-cumbre', name: 'Chaqueta Cumbre', price: 89990, tone: '#c2410c', blurb: 'Impermeable, liviana y con capucha ajustable para el viento de altura.' },
    { slug: 'mochila-ruta-30', name: 'Mochila Ruta 30 L', price: 54990, tone: '#1d4ed8', blurb: 'Espalda ventilada, funda para lluvia y bolsillo para hidratación.' },
    { slug: 'botas-de-montana', name: 'Botas de montaña', price: 119990, tone: '#78350f', blurb: 'Suela de alto agarre y membrana transpirable para senderos mixtos.' },
    { slug: 'termo-glaciar', name: 'Termo Glaciar 1 L', price: 24990, tone: '#0f766e', blurb: 'Mantiene el agua caliente 24 horas y fría 48 horas.' },
    { slug: 'gorro-lana-merino', name: 'Gorro de lana merino', price: 17990, tone: '#6d28d9', blurb: 'Suave, abrigador y sin picor, hecho con lana de ovejas de la Patagonia.' },
    { slug: 'baston-trekking', name: 'Bastón de trekking', price: 32990, tone: '#334155', blurb: 'Aluminio plegable en tres tramos con empuñadura de corcho.' },
    { slug: 'carpa-domo-2', name: 'Carpa Domo 2 personas', price: 149990, tone: '#15803d', blurb: 'Armado en cinco minutos, doble techo y ábside para las mochilas.' }
];

export const price = (value: number): string =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

export const findProduct = (slug: string): Product | undefined => PRODUCTS.find((product) => product.slug === slug);
