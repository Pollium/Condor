import { PRODUCTS, Product, price } from '../products';

const card = (product: Product): string => `
    <a class="card" href="/productos/${product.slug}" data-link>
        <span class="swatch" style="background:${product.tone}"></span>
        <strong>${product.name}</strong>
        <span class="muted">${price(product.price)}</span>
    </a>
`;

export const home = (): string => `
    <section class="hero">
        <h1>Equipo para subir más alto</h1>
        <p class="muted">Ropa técnica y accesorios probados en la cordillera.</p>
        <a class="button" href="/productos" data-link>Ver productos</a>
    </section>
    <h2>Lo más vendido</h2>
    <div class="grid">${PRODUCTS.slice(0, 4).map(card).join('')}</div>
`;

export const catalog = (): string => `
    <h1>Productos</h1>
    <div class="grid">${PRODUCTS.map(card).join('')}</div>
`;

export const deals = (): string => `
    <h1>Ofertas</h1>
    <p class="muted">Precios de temporada hasta agotar stock.</p>
    <div class="grid">${PRODUCTS.filter((_, index) => index % 2 === 0).map(card).join('')}</div>
`;

export const product = (item: Product): string => `
    <article class="product">
        <span class="swatch large" style="background:${item.tone}"></span>
        <div>
            <h1>${item.name}</h1>
            <p class="price">${price(item.price)}</p>
            <p>${item.blurb}</p>
            <p id="stock" class="muted">Consultando stock…</p>
            <span class="more">Ver más detalles</span>
            <div class="actions">
                <button type="button" class="button" data-action="add" data-slug="${item.slug}">Añadir al carrito</button>
            </div>
        </div>
    </article>
`;

export const missing = (): string => `
    <h1>No encontramos esta página</h1>
    <a href="/" data-link>Volver al inicio</a>
`;
