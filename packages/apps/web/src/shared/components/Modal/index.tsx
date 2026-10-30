import { Modal as CarbonModal } from '@carbon/react';
import { copy } from '@/shared/i18n';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    width?: 'xs' | 'sm' | 'md' | 'lg';
    children: ReactNode;
}

const Modal = ({ isOpen, onOpenChange, title, width = 'sm', children }: ModalProps) => createPortal(
    <CarbonModal open={isOpen} onRequestClose={() => onOpenChange(false)} passiveModal modalHeading={title} size={width} closeButtonLabel={copy.close}>
        {children}
    </CarbonModal>,
    document.body
);

export default Modal;
