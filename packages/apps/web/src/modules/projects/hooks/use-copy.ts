import { useState } from 'react';

export const useCopy = () => {
    const [copied, setCopied] = useState<string | null>(null);

    const copy = async (id: string, text: string) => {
        try{
            await navigator.clipboard.writeText(text);
            setCopied(id);
            window.setTimeout(() => setCopied(null), 1600);
        }catch{
            setCopied(null);
        }
    };

    return { copied, copy };
};
