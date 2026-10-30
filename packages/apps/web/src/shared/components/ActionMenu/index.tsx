import { OverflowMenu } from '@carbon/react';
import { copy } from '@/shared/i18n';
import type { ReactNode } from 'react';

interface ActionMenuProps{
    subject: string;
    ariaLabel?: string;
    children: ReactNode;
}

const ActionMenu = ({ subject, ariaLabel, children }: ActionMenuProps) => (
    <OverflowMenu aria-label={ariaLabel ?? copy.actionsOf(subject)} iconDescription={ariaLabel ?? copy.actionsOf(subject)} flipped size='md'>
        {children}
    </OverflowMenu>
);

export default ActionMenu;
