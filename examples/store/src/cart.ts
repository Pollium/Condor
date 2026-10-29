const KEY = 'andes.cart';

export const readCart = (): string[] => {
    try{
        return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[];
    }catch{
        return [];
    }
};

export const addToCart = (slug: string) => {
    localStorage.setItem(KEY, JSON.stringify([...readCart(), slug]));
};

export const clearCart = () => localStorage.removeItem(KEY);
