import { OverflowMenu } from '@carbon/react';
import type { ReactNode } from 'react';

interface ActionMenuProps{
    subject: string;
    ariaLabel?: string;
    children: ReactNode;
}

const ActionMenu = ({ subject, ariaLabel, children }: ActionMenuProps) => (
    <OverflowMenu aria-label={ariaLabel ?? `Acciones de ${subject}`} iconDescription={ariaLabel ?? `Acciones de ${subject}`} flipped size='md'>
        {children}
    </OverflowMenu>
);

export default ActionMenu;
