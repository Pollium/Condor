import { readCart } from '../cart';

export const layout = (content: string): string => `
    <header class="bar">
        <a href="/" data-link class="brand">Tienda Andes</a>
        <nav>
            <a href="/productos" data-link>Productos</a>
            <a href="/ofertas" data-link>Ofertas</a>
            <a href="/cuenta" data-link>Cuenta</a>
            <a href="/carrito" data-link class="cart">Carrito (${readCart().length})</a>
        </nav>
    </header>
    <main class="page">${content}</main>
    <footer class="foot">Envíos a todo Chile · Cambios gratis en 30 días</footer>
`;
