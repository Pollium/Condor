const MAX_DEPTH = 5;
const MAX_TEXT = 80;
const STABLE_ATTRIBUTES = ['data-condor', 'data-testid', 'data-test', 'data-cy'];
const NOISY_CLASS = /^(?:[a-z]+-[a-z0-9]{5,}|css-[\w-]+|sc-[\w-]+|_\w+|\w*\d{3,}\w*)$/;

const escape = (value: string): string =>
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(value) : value.replace(/[^\w-]/g, '\\$&');

const stableAttribute = (element: Element): string | null => {
    for(const name of STABLE_ATTRIBUTES){
        const value = element.getAttribute(name);
        if(value) return `[${name}="${value.replace(/"/g, '\\"')}"]`;
    }
    return null;
};

const classesOf = (element: Element): string =>
    Array.from(element.classList)
        .filter((name) => !NOISY_CLASS.test(name))
        .slice(0, 2)
        .map((name) => `.${escape(name)}`)
        .join('');

const nthOfType = (element: Element): string => {
    const parent = element.parentElement;
    if(parent === null) return '';
    const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
    return siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(element) + 1})` : '';
};

const segmentOf = (element: Element): string =>
    `${element.tagName.toLowerCase()}${classesOf(element)}${nthOfType(element)}`;

export const selectorOf = (target: Element): string => {
    const parts: string[] = [];
    let element: Element | null = target;

    while(element !== null && element !== document.documentElement && parts.length < MAX_DEPTH){
        if(element.id && !/\d{3,}/.test(element.id)){
            parts.unshift(`#${escape(element.id)}`);
            break;
        }
        const stable = stableAttribute(element);
        if(stable !== null){
            parts.unshift(stable);
            break;
        }
        parts.unshift(segmentOf(element));
        element = element.parentElement;
    }

    return parts.join(' > ');
};

const FORM_FIELDS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);

export const textOf = (target: Element): string | undefined => {
    if(FORM_FIELDS.has(target.tagName) || target.closest('[data-condor-mask]') !== null) return undefined;
    const text = (target.textContent ?? '').replace(/\s+/g, ' ').trim();
    if(text === '') return undefined;
    return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 1)}…` : text;
};

const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [onclick], [contenteditable="true"]';

export const isInteractive = (target: Element): boolean => target.closest(INTERACTIVE) !== null;

export const clickedElement = (target: Element): Element => target.closest(INTERACTIVE) ?? target;
