import { Modal as CarbonModal } from '@carbon/react';
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
    <CarbonModal open={isOpen} onRequestClose={() => onOpenChange(false)} passiveModal modalHeading={title} size={width} closeButtonLabel='Cerrar'>
        {children}
    </CarbonModal>,
    document.body
);

export default Modal;
