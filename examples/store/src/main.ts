import { condor } from '@condor/browser';
import './styles.css';
import { addToCart, clearCart, readCart } from './cart';
import { findProduct } from './products';
import { catalog, deals, home, missing, product } from './views/catalog';
import { account, cart, checkout, done } from './views/checkout';
import { layout } from './views/layout';

const key = import.meta.env.VITE_CONDOR_KEY;
if(key){
    condor.init({ key, host: import.meta.env.VITE_CONDOR_HOST ?? 'http://localhost:4100', release: '1.4.0' });
}

const app = document.getElementById('app')!;
const USER_KEY = 'andes.user';

const viewFor = (path: string): { title: string; html: string; slug?: string } => {
    if(path === '/') return { title: 'Tienda Andes — Ropa y equipo de montaña', html: home() };
    if(path === '/productos') return { title: 'Productos · Tienda Andes', html: catalog() };
    if(path === '/ofertas') return { title: 'Ofertas · Tienda Andes', html: deals() };
    if(path === '/carrito') return { title: 'Carrito · Tienda Andes', html: cart() };
    if(path === '/checkout') return { title: 'Pago · Tienda Andes', html: checkout() };
    if(path === '/gracias') return { title: 'Gracias · Tienda Andes', html: done() };
    if(path === '/cuenta') return { title: 'Mi cuenta · Tienda Andes', html: account(localStorage.getItem(USER_KEY)) };

    const slug = path.match(/^\/productos\/([\w-]+)$/)?.[1];
    const item = slug === undefined ? undefined : findProduct(slug);
    if(item !== undefined) return { title: `${item.name} · Tienda Andes`, html: product(item), slug: item.slug };
    return { title: 'No encontrado · Tienda Andes', html: missing() };
};

const checkStock = async (slug: string) => {
    const target = document.getElementById('stock');
    const response = await fetch(`/api/stock/${slug}`);
    if(target === null) return;
    if(!response.ok){
        target.textContent = 'No pudimos consultar el stock. Intenta de nuevo.';
        return;
    }
    const { units } = await response.json() as { units: number };
    target.textContent = `${units} unidades disponibles`;
};

const render = () => {
    const view = viewFor(window.location.pathname);
    document.title = view.title;
    app.innerHTML = layout(view.html);
    window.scrollTo(0, 0);
    if(view.slug !== undefined){
        condor.track('product_viewed', { slug: view.slug });
        void checkStock(view.slug);
    }
};

const go = (path: string) => {
    history.pushState(null, '', path);
    render();
};

const applyCoupon = () => {
    const coupons = Math.random() < 0.4 ? undefined : { ANDES10: { discount: 0.1 } };
    const code = (document.getElementById('coupon') as HTMLInputElement | null)?.value || 'ANDES10';
    const discount = (coupons as Record<string, { discount: number }> | undefined)![code].discount;
    window.alert(`Descuento de ${Math.round(discount * 100)} % aplicado`);
};

document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>('a[data-link]');
    const action = target?.closest<HTMLElement>('[data-action]')?.dataset.action;

    if(action === 'add'){
        const slug = target!.closest<HTMLElement>('[data-slug]')!.dataset.slug!;
        addToCart(slug);
        condor.track('add_to_cart', { slug, price: findProduct(slug)?.price ?? 0 });
        render();
        return;
    }
    if(action === 'coupon'){
        applyCoupon();
        return;
    }
    if(action === 'checkout') condor.track('checkout_started', { items: readCart().length });
    if(link !== null && link !== undefined){
        event.preventDefault();
        go(link.pathname);
    }
});

document.addEventListener('submit', (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if(form === null) return;
    event.preventDefault();

    if(form.dataset.form === 'signin'){
        const email = String(new FormData(form).get('email'));
        const name = email.split('@')[0].replace(/[._]/g, ' ');
        localStorage.setItem(USER_KEY, name);
        condor.identify(email, { email, name });
        render();
        return;
    }
    if(form.dataset.form === 'pay'){
        const button = document.getElementById('pay') as HTMLButtonElement;
        button.textContent = 'Procesando…';
        window.setTimeout(() => {
            const value = readCart().reduce((sum, slug) => sum + (findProduct(slug)?.price ?? 0), 0);
            condor.track('purchase_completed', { value });
            clearCart();
            go('/gracias');
        }, 2500);
    }
});

window.addEventListener('popstate', render);
render();
