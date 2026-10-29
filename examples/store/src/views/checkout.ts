import { readCart } from '../cart';
import { findProduct, price } from '../products';

const total = (): number => readCart().reduce((sum, slug) => sum + (findProduct(slug)?.price ?? 0), 0);

export const cart = (): string => {
    const items = readCart().map((slug) => findProduct(slug)).filter((item) => item !== undefined);
    if(items.length === 0) return '<h1>Tu carrito está vacío</h1><a class="button" href="/productos" data-link>Ver productos</a>';
    return `
        <h1>Carrito</h1>
        <ul class="lines">${items.map((item) => `<li><span>${item.name}</span><span>${price(item.price)}</span></li>`).join('')}</ul>
        <div class="coupon">
            <input id="coupon" placeholder="Código de descuento" aria-label="Código de descuento" />
            <button type="button" class="ghost" data-action="coupon">Aplicar cupón</button>
        </div>
        <p class="price">Total ${price(total())}</p>
        <a class="button" href="/checkout" data-link data-action="checkout">Ir a pagar</a>
    `;
};

export const checkout = (): string => `
    <h1>Pago</h1>
    <form class="form" data-form="pay">
        <label>Nombre en la tarjeta<input name="holder" autocomplete="cc-name" required /></label>
        <label>Número de tarjeta<input name="card" inputmode="numeric" autocomplete="cc-number" required /></label>
        <p class="price">Total ${price(total())}</p>
        <button type="submit" class="button" id="pay">Pagar</button>
    </form>
`;

export const done = (): string => `
    <h1>¡Gracias por tu compra!</h1>
    <p class="muted">Te enviamos el detalle por correo.</p>
    <a class="button" href="/" data-link>Seguir comprando</a>
`;

export const account = (signedIn: string | null): string => signedIn ? `
    <h1>Hola, ${signedIn}</h1>
    <p class="muted">Tus pedidos aparecerán aquí.</p>
` : `
    <h1>Entra a tu cuenta</h1>
    <form class="form" data-form="signin">
        <label>Correo<input name="email" type="email" autocomplete="email" required /></label>
        <label>Contraseña<input name="password" type="password" autocomplete="current-password" required /></label>
        <button type="submit" class="button">Entrar</button>
    </form>
`;
