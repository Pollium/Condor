import { chromium, devices } from 'playwright-core';

const argument = (name, fallback) => {
    const index = process.argv.indexOf(`--${name}`);
    return index === -1 ? fallback : process.argv[index + 1];
};

const STORE = argument('store', 'http://localhost:5191');
const API = argument('api', 'http://localhost:4100');
const VISITORS = Number(argument('visitors', '20'));
const CONCURRENCY = Number(argument('concurrency', '4'));

const PLACES = [
    { locale: 'es-CL', timezoneId: 'America/Santiago', country: 'CL', cities: ['Santiago', 'Concepción', 'Valparaíso', 'Temuco'] },
    { locale: 'es-MX', timezoneId: 'America/Mexico_City', country: 'MX', cities: ['Ciudad de México', 'Guadalajara', 'Monterrey'] },
    { locale: 'es-CO', timezoneId: 'America/Bogota', country: 'CO', cities: ['Bogotá', 'Medellín'] },
    { locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires', country: 'AR', cities: ['Buenos Aires', 'Córdoba'] },
    { locale: 'es-PE', timezoneId: 'America/Lima', country: 'PE', cities: ['Lima', 'Arequipa'] },
    { locale: 'es-ES', timezoneId: 'Europe/Madrid', country: 'ES', cities: ['Madrid', 'Barcelona'] }
];
const ENTRIES = [
    { path: '/', referer: null },
    { path: '/?utm_source=instagram&utm_medium=social&utm_campaign=primavera', referer: null },
    { path: '/productos', referer: 'https://www.google.com/' },
    { path: '/ofertas', referer: 'https://l.instagram.com/' },
    { path: '/productos/chaqueta-cumbre', referer: 'https://web.whatsapp.com/' },
    { path: '/productos/botas-de-montana', referer: 'https://chatgpt.com/' }
];
const SLUGS = ['chaqueta-cumbre', 'mochila-ruta-30', 'botas-de-montana', 'termo-glaciar', 'gorro-lana-merino', 'baston-trekking', 'carpa-domo-2'];
const NAMES = ['valentina.rojas', 'mateo.gonzalez', 'camila.fuentes', 'benjamin.soto', 'isidora.munoz', 'joaquin.herrera', 'martina.lopez', 'tomas.silva'];

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const chance = (probability) => Math.random() < probability;
const pause = (page, min, max) => page.waitForTimeout(min + Math.random() * (max - min));

const scroll = async (page) => {
    for(let i = 0; i < 3 + Math.floor(Math.random() * 4); i += 1){
        await page.mouse.wheel(0, 250 + Math.random() * 400);
        await pause(page, 250, 700);
    }
};

const clickNav = async (page, selector) => {
    const target = page.locator(selector).first();
    if(await target.count() === 0) return false;
    await target.click({ timeout: 3000 }).catch(() => undefined);
    await pause(page, 600, 1600);
    return true;
};

const browse = async (page, summary) => {
    await scroll(page);
    for(let i = 0; i < 1 + Math.floor(Math.random() * 3); i += 1){
        await clickNav(page, 'nav a[href="/productos"]');
        await clickNav(page, `a.card[href="/productos/${pick(SLUGS)}"]`);
        summary.push('producto');
        await pause(page, 800, 2200);
        await scroll(page);
        if(chance(0.35)){
            for(let n = 0; n < 1 + Math.floor(Math.random() * 2); n += 1){
                await page.locator('.more').click().catch(() => undefined);
                await pause(page, 1300, 2200);
            }
            summary.push('ver-más');
        }
        if(chance(0.55)){
            await clickNav(page, '[data-action="add"]');
            summary.push('carrito');
        }
    }
};

const buy = async (page, summary) => {
    await clickNav(page, 'a.cart');
    if(chance(0.5)){
        await page.fill('#coupon', 'ANDES10').catch(() => undefined);
        await clickNav(page, '[data-action="coupon"]');
        summary.push('cupón');
    }
    if(!chance(0.7)) return;
    await clickNav(page, '[data-action="checkout"]');
    await page.fill('input[name="holder"]', 'Visitante de prueba').catch(() => undefined);
    await page.fill('input[name="card"]', '4242424242424242').catch(() => undefined);
    const pay = page.locator('#pay');
    await pay.click().catch(() => undefined);
    if(chance(0.5)){
        for(let i = 0; i < 4; i += 1){
            await pay.click({ force: true, timeout: 500 }).catch(() => undefined);
            await page.waitForTimeout(120);
        }
        summary.push('rabia');
    }
    await page.waitForTimeout(3200);
    summary.push('compra');
};

const visit = async (browser, index) => {
    const place = pick(PLACES);
    const city = pick(place.cities);
    const mobile = chance(0.4);
    const entry = pick(ENTRIES);
    const context = await browser.newContext({
        ...(mobile ? devices['iPhone 13'] : { viewport: { width: pick([1440, 1536, 1920, 1280]), height: 900 } }),
        locale: place.locale,
        timezoneId: place.timezoneId,
        ...(entry.referer ? { extraHTTPHeaders: { referer: entry.referer } } : {})
    });
    await context.route(`${API}/**`, (route) => route.continue({
        headers: { ...route.request().headers(), 'x-geo-country': place.country, 'x-geo-city': encodeURIComponent(city) }
    }));
    const page = await context.newPage();
    page.on('dialog', (dialog) => dialog.dismiss().catch(() => undefined));
    const summary = [];

    await page.goto(`${STORE}${entry.path}`, { waitUntil: 'domcontentloaded' });
    await pause(page, 1200, 2500);
    if(chance(0.25)){
        await clickNav(page, 'nav a[href="/cuenta"]');
        await page.fill('input[name="email"]', `${pick(NAMES)}${index}@correo.test`).catch(() => undefined);
        await page.fill('input[name="password"]', 'secreto-123').catch(() => undefined);
        await clickNav(page, 'form .button');
        summary.push('identifica');
    }
    if(chance(0.85)) await browse(page, summary);
    if(chance(0.5)) await buy(page, summary);
    if(chance(0.3)){
        await page.goBack().catch(() => undefined);
        await pause(page, 300, 900);
        await page.goForward().catch(() => undefined);
    }
    await page.waitForTimeout(6500);
    await context.close();
    console.log(`${String(index).padStart(3)} ${mobile ? 'móvil  ' : 'desktop'} ${place.country} ${city.padEnd(16)} ${summary.join(' → ') || 'solo mira'}`);
};

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
let next = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while(next < VISITORS){
        const index = next;
        next += 1;
        await visit(browser, index).catch((error) => console.log(`${index} falló: ${error.message.split('\n')[0]}`));
    }
}));
await browser.close();
