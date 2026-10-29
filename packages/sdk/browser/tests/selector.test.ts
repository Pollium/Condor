import { isInteractive, selectorOf, textOf } from '../src/selector';
import { describe, expect, it } from 'vitest';

describe('selectorOf', () => {
    it('stops at an id', () => {
        document.body.innerHTML = '<main id="shop"><section><button class="buy primary">Comprar</button></section></main>';
        expect(selectorOf(document.querySelector('button')!)).toBe('#shop > section > button.buy.primary');
    });

    it('prefers stable test attributes and numbers repeated siblings', () => {
        document.body.innerHTML = '<ul data-testid="cart"><li>Uno</li><li><span>Dos</span></li></ul>';
        expect(selectorOf(document.querySelector('li:nth-child(2) span')!)).toBe('[data-testid="cart"] > li:nth-of-type(2) > span');
    });

    it('skips generated class names and ids', () => {
        document.body.innerHTML = '<div id="root-12345"><a class="css-1x2y3z nav">Ofertas</a></div>';
        expect(selectorOf(document.querySelector('a')!)).toBe('body > div > a.nav');
    });
});

describe('textOf', () => {
    it('reads visible text, trimmed and collapsed', () => {
        document.body.innerHTML = '<button>  Añadir \n al   carrito </button>';
        expect(textOf(document.querySelector('button')!)).toBe('Añadir al carrito');
    });

    it('never reads form fields or masked regions', () => {
        document.body.innerHTML = '<input value="secreto"><div data-condor-mask><b>Tarjeta 4242</b></div>';
        expect(textOf(document.querySelector('input')!)).toBeUndefined();
        expect(textOf(document.querySelector('b')!)).toBeUndefined();
    });
});

describe('isInteractive', () => {
    it('treats links, buttons and their children as interactive', () => {
        document.body.innerHTML = '<a href="/"><span id="inner">Inicio</span></a><span id="plain">Ver más</span>';
        expect(isInteractive(document.getElementById('inner')!)).toBe(true);
        expect(isInteractive(document.getElementById('plain')!)).toBe(false);
    });
});
